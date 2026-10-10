# auth-middleware

Hono + Better-Auth

1. Usage
```ts
// auth.ts
import { betterAuth } from "better-auth";
import { defaultStatements } from "better-auth/plugins/admin/access";

// Optional
export const statement = {
  ...defaultStatements,
  todo: ["create", "read", "update", "delete"],
} as const;

const auth = betterAuth({...});

// middleware.ts
import { createAuthMiddleware } from "@vicstack/auth-middleware";

const { sessionMiddleware, requireSessionMiddleware } = createAuthMiddleware(auth);

// If using the adminPlugin
const { sessionMiddleware, requireSessionMiddleware, requirePermissionMiddleware } = createAuthMiddleware(auth, statement);

// route.ts
const app = new Hono();

app
  .use(sessionMiddleware) 
  .get("/", async (c) => {
    const session = c.get("session"); // session possibly null
  })
  .use(requireSessionMiddleware) // Returns { message: "Unauthenticated" } with 401
  .get("/", async (c) => {
    const { user } = c.get("session"); // Fully typed
    ...
  )
  .post(
    "/",
    requirePermissionMiddleware({todo: ["create"]}), // Returns { message: "Unauthorized" } with 403
    async (c) => {
    ...
  })
 ```
