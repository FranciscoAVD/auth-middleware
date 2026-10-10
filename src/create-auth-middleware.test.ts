import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { createAuthMiddleware } from "./index";

const session = { session: { id: "s1" }, user: { id: "u1", name: "Ada" } };

function fakeAuth(overrides: {
  getSession?: () => Promise<typeof session | null>;
  userHasPermission?: () => Promise<{ success: boolean }>;
} = {}) {
  return {
    api: {
      getSession: overrides.getSession ?? (async () => session),
      userHasPermission: overrides.userHasPermission ?? (async () => ({ success: true })),
    },
  };
}

describe("createAuthMiddleware", () => {
  test("sessionMiddleware attaches the session", async () => {
    const { sessionMiddleware } = createAuthMiddleware(fakeAuth());
    const app = new Hono().use(sessionMiddleware).get("/", (c) => c.json(c.get("session")));

    const res = await app.request("/");
    expect(await res.json()).toEqual(session);
  });

  test("requireSessionMiddleware 401s without a session", async () => {
    const { requireSessionMiddleware } = createAuthMiddleware(
      fakeAuth({ getSession: async () => null }),
    );
    const app = new Hono().use(requireSessionMiddleware).get("/", (c) => c.json({ ok: true }));

    const res = await app.request("/");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "Unauthenticated" });
  });

  test("requirePermissionMiddleware 403s when the permission check fails", async () => {
    const statement = { todo: ["create"] } as const;
    const { sessionMiddleware, requireSessionMiddleware, requirePermissionMiddleware } =
      createAuthMiddleware(
        fakeAuth({ userHasPermission: async () => ({ success: false }) }),
        statement,
      );
    const app = new Hono()
      .use(sessionMiddleware)
      .use(requireSessionMiddleware)
      .get("/", requirePermissionMiddleware({ todo: ["create"] }), (c) => c.json({ ok: true }));

    const res = await app.request("/");
    expect(res.status).toBe(403);
  });

  test("requirePermissionMiddleware passes through when the permission check succeeds", async () => {
    const statement = { todo: ["create"] } as const;
    const { sessionMiddleware, requireSessionMiddleware, requirePermissionMiddleware } =
      createAuthMiddleware(fakeAuth(), statement);
    const app = new Hono()
      .use(sessionMiddleware)
      .use(requireSessionMiddleware)
      .get("/", requirePermissionMiddleware({ todo: ["create"] }), (c) => c.json({ ok: true }));

    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
