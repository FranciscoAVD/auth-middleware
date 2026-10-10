import HTTP from "@vicstack/http";
import tryCatch from "@vicstack/try-catch";
import { createMiddleware } from "hono/factory";
import type { RequireSessionEnv } from "./require";

export type AuthWithPermissions = {
  api: {
    userHasPermission: (opts: {
      body: { userId: string; permissions: Record<string, string[]> };
    }) => Promise<{ success: boolean }>;
  };
};

export type PermissionsFor<Statement> = {
  [Resource in keyof Statement]?: Statement[Resource] extends readonly (infer Action)[]
    ? Action[]
    : never;
};

/**
 * Responds 403 with `{ message: "Unauthorized" }` unless the session user has
 * every listed permission. Must run after `requireSessionMiddleware`.
 */
export const createRequirePermissionMiddleware = <
  TSession extends { user: { id: string } },
  Statement extends Record<string, readonly string[]>,
>(
  auth: AuthWithPermissions,
) => {
  return (permissions: PermissionsFor<Statement>) =>
    createMiddleware<RequireSessionEnv<TSession>>(async (c, next) => {
      const { user } = c.get("session");

      const [can, error] = await tryCatch(
        auth.api.userHasPermission({
          body: {
            userId: user.id,
            permissions: permissions as Record<string, string[]>,
          },
        }),
      );

      if (error) {
        return c.json(
          { message: "Something went wrong. Try again later." },
          HTTP.InternalServerError,
        );
      }

      if (!can.success) {
        return c.json({ message: "Unauthorized" }, HTTP.Forbidden);
      }

      await next();
    });
};
