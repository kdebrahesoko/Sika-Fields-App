import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { type Express } from "express";
import request from "supertest";

type Role = "admin" | "user" | undefined;

const state: {
  currentUserId: string | undefined;
  roles: Record<string, Role>;
} = {
  currentUserId: undefined,
  roles: {},
};

const getUserList = vi.fn(async () => ({
  data: [
    {
      id: "user_admin",
      emailAddresses: [{ emailAddress: "admin@example.com" }],
      firstName: "Ada",
      lastName: "Admin",
      imageUrl: "https://example.com/a.png",
      publicMetadata: { role: "admin" },
      createdAt: 1700000000000,
      lastSignInAt: 1700000001000,
    },
  ],
}));
const getUser = vi.fn(async (id: string) => ({
  id,
  publicMetadata: { role: state.roles[id] },
}));
const updateUserMetadata = vi.fn(async (id: string, params: { publicMetadata: { role?: string } }) => ({
  id,
  publicMetadata: params.publicMetadata,
}));
const deleteUser = vi.fn(async (_id: string) => undefined);
const createInvitation = vi.fn(async (params: { emailAddress: string; publicMetadata?: { role?: string } }) => ({
  id: "inv_1",
  emailAddress: params.emailAddress,
  publicMetadata: params.publicMetadata,
}));

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: (_req: unknown) => ({ userId: state.currentUserId }),
  clerkClient: {
    users: { getUserList, getUser, updateUserMetadata, deleteUser },
    invitations: { createInvitation },
  },
}));

let app: Express;

beforeEach(async () => {
  state.currentUserId = undefined;
  state.roles = {
    user_admin: "admin",
    user_regular: "user",
  };
  vi.clearAllMocks();

  const router = (await import("./index")).default;
  app = express();
  app.use(express.json());
  app.use("/api", router);
});

const endpoints: Array<{
  name: string;
  call: (agent: request.Agent) => request.Test;
}> = [
  {
    name: "GET /api/admin/users",
    call: (a) => a.get("/api/admin/users"),
  },
  {
    name: "POST /api/admin/users/invite",
    call: (a) =>
      a.post("/api/admin/users/invite").send({ email: "new@example.com", role: "user" }),
  },
  {
    name: "PATCH /api/admin/users/:id/role",
    call: (a) => a.patch("/api/admin/users/user_regular/role").send({ role: "admin" }),
  },
  {
    name: "DELETE /api/admin/users/:id",
    call: (a) => a.delete("/api/admin/users/user_regular"),
  },
];

describe("admin API auth matrix", () => {
  for (const { name, call } of endpoints) {
    describe(name, () => {
      it("returns 401 with no Clerk session", async () => {
        state.currentUserId = undefined;
        const res = await call(request(app));
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: "Unauthorized" });
      });

      it("returns 403 when signed in as a non-admin", async () => {
        state.currentUserId = "user_regular";
        const res = await call(request(app));
        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: "Admin access required" });
      });

      it("returns 200 when signed in as an admin", async () => {
        state.currentUserId = "user_admin";
        const res = await call(request(app));
        expect(res.status).toBe(200);
      });
    });
  }
});
