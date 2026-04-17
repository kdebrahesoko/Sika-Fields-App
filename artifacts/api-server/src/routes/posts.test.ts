import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { type Express } from "express";
import request from "supertest";

const state: {
  currentUserId: string | undefined;
  docs: Record<string, { _type: string }>;
  sanityConfigured: boolean;
} = {
  currentUserId: undefined,
  docs: {},
  sanityConfigured: true,
};

const fetchMock = vi.fn(async (_query: string, params: { id: string }) => {
  return state.docs[params.id] ?? null;
});
const deleteMock = vi.fn(async (_id: string) => undefined);

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: (_req: unknown) => ({ userId: state.currentUserId }),
  clerkClient: {
    users: {
      getUser: async (id: string) => ({ id, publicMetadata: { role: "admin" } }),
    },
  },
}));

vi.mock("../lib/sanity-write", () => ({
  getSanityWriteClient: () =>
    state.sanityConfigured
      ? { fetch: fetchMock, delete: deleteMock }
      : null,
  toPortableText: () => [],
  uploadImageBuffer: async () => ({ assetId: "x", ref: "x", url: "x" }),
}));

let app: Express;

beforeEach(async () => {
  state.currentUserId = "user_admin";
  state.sanityConfigured = true;
  state.docs = {
    "doc-event-1": { _type: "event" },
    "doc-author-1": { _type: "author" },
  };
  vi.clearAllMocks();

  const router = (await import("./index")).default;
  app = express();
  app.use(express.json());
  app.use("/api", router);
});

describe("DELETE /api/admin/posts/:id", () => {
  it("returns 401 without a session", async () => {
    state.currentUserId = undefined;
    const res = await request(app).delete("/api/admin/posts/doc-event-1");
    expect(res.status).toBe(401);
  });

  it("rejects ids that fail the format check", async () => {
    const res = await request(app).delete("/api/admin/posts/has%20space");
    expect(res.status).toBe(400);
  });

  it("returns 503 when Sanity is not configured", async () => {
    state.sanityConfigured = false;
    const res = await request(app).delete("/api/admin/posts/doc-event-1");
    expect(res.status).toBe(503);
    expect(res.body.code).toBe("sanity_not_configured");
  });

  it("returns 404 when the document does not exist", async () => {
    const res = await request(app).delete("/api/admin/posts/missing-id");
    expect(res.status).toBe(404);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("refuses to delete non-post documents", async () => {
    const res = await request(app).delete("/api/admin/posts/doc-author-1");
    expect(res.status).toBe(400);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes a valid post document", async () => {
    const res = await request(app).delete("/api/admin/posts/doc-event-1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, id: "doc-event-1" });
    expect(deleteMock).toHaveBeenCalledWith("doc-event-1");
  });
});
