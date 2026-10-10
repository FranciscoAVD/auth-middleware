import { createSessionMiddleware, type AuthWithSession } from "./middleware/session";
import { createRequireSessionMiddleware } from "./middleware/require";
import {
  createRequirePermissionMiddleware,
  type AuthWithPermissions,
} from "./middleware/permission";

/**
 * Builds a `sessionMiddleware` that reads the session into context, and a
 * `requireSessionMiddleware` that 401s when it's missing.
 */
export function createAuthMiddleware<TSession>(
  auth: AuthWithSession<TSession>,
): {
  sessionMiddleware: ReturnType<typeof createSessionMiddleware<TSession>>;
  requireSessionMiddleware: ReturnType<typeof createRequireSessionMiddleware<TSession>>;
};
/**
 * Same as the single-argument overload, plus a `requirePermissionMiddleware(permissions)`
 * that 403s unless the session user holds every listed permission in `statement`.
 */
export function createAuthMiddleware<
  TSession extends { user: { id: string } },
  Statement extends Record<string, readonly string[]>,
>(
  auth: AuthWithSession<TSession> & AuthWithPermissions,
  statement: Statement,
): {
  sessionMiddleware: ReturnType<typeof createSessionMiddleware<TSession>>;
  requireSessionMiddleware: ReturnType<typeof createRequireSessionMiddleware<TSession>>;
  requirePermissionMiddleware: ReturnType<
    typeof createRequirePermissionMiddleware<TSession, Statement>
  >;
};
export function createAuthMiddleware(auth: any, statement?: any): any {
  const sessionMiddleware = createSessionMiddleware(auth);
  const requireSessionMiddleware = createRequireSessionMiddleware();

  if (!statement) {
    return { sessionMiddleware, requireSessionMiddleware };
  }

  return {
    sessionMiddleware,
    requireSessionMiddleware,
    requirePermissionMiddleware: createRequirePermissionMiddleware(
      auth as AuthWithPermissions,
    ),
  };
}
