import HTTP from "@vicstack/http";
import { createMiddleware } from "hono/factory";
import type { SessionEnv } from "./session";

export type RequireSessionEnv<TSession> = {
  Variables: {
    session: NonNullable<TSession>;
  };
};

/**
 * Responds 401 with `{ message: "Unauthenticated" }` unless `session` is
 * already set. Must run after `sessionMiddleware`.
 */
export const createRequireSessionMiddleware = <TSession>() =>
  createMiddleware<RequireSessionEnv<TSession>>(async (c, next) => {
    const session = c.get("session") as SessionEnv<TSession>["Variables"]["session"];
    if (!session) {
      return c.json({ message: "Unauthenticated" }, HTTP.Unauthorized);
    }
    await next();
  });
