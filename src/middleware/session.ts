import { createMiddleware } from "hono/factory";

export type AuthWithSession<TSession> = {
  api: {
    getSession: (opts: { headers: Headers }) => Promise<TSession | null>;
  };
};

export type SessionEnv<TSession> = {
  Variables: {
    session: TSession | null;
  };
};

/**
 * Reads the current session from `auth` and attaches it to the context as
 * `session` (`null` if there is none).
 */
export const createSessionMiddleware = <TSession>(
  auth: AuthWithSession<TSession>,
) =>
  createMiddleware<SessionEnv<TSession>>(async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    c.set("session", session);
    await next();
  });
