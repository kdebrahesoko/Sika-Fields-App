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
const requestMock = vi.fn(async (_args: { url: string }) => "" as unknown);
const createOrReplaceMock = vi.fn(async (doc: { _id: string }) => doc);

vi.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: (_req: unknown) => ({ userId: state.currentUserId }),
  clerkClient: {
    users: {
      getUser: async (id: string) => ({
        id,
        publicMetadata: { role: "admin" },
        firstName: "Ada",
        lastName: "Lovelace",
        emailAddresses: [{ emailAddress: "ada@example.com" }],
      }),
    },
  },
}));

vi.mock("../lib/sanity-write", () => ({
  getSanityWriteClient: () =>
    state.sanityConfigured
      ? {
          fetch: fetchMock,
          delete: deleteMock,
          request: requestMock,
          createOrReplace: createOrReplaceMock,
        }
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

describe("GET /api/admin/posts/:id/revisions", () => {
  it("returns 401 without a session", async () => {
    state.currentUserId = undefined;
    const res = await request(app).get("/api/admin/posts/doc-event-1/revisions");
    expect(res.status).toBe(401);
  });

  it("rejects ids that fail the format check", async () => {
    const res = await request(app).get("/api/admin/posts/has%20space/revisions");
    expect(res.status).toBe(400);
  });

  it("returns 503 when Sanity is not configured", async () => {
    state.sanityConfigured = false;
    const res = await request(app).get("/api/admin/posts/doc-event-1/revisions");
    expect(res.status).toBe(503);
  });

  it("parses NDJSON transactions into a revision list newest-first", async () => {
    requestMock.mockResolvedValueOnce(
      [
        JSON.stringify({ id: "tx-old", timestamp: "2026-04-10T12:00:00Z" }),
        JSON.stringify({ id: "tx-new", timestamp: "2026-04-15T12:00:00Z" }),
        "", // blank lines must be ignored
        "not-json", // malformed lines must be skipped without crashing
      ].join("\n"),
    );
    const res = await request(app).get("/api/admin/posts/doc-event-1/revisions");
    expect(res.status).toBe(200);
    expect(res.body.revisions.map((r: { id: string }) => r.id)).toEqual([
      "tx-new",
      "tx-old",
    ]);
    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("/data/history/production/transactions/doc-event-1"),
      }),
    );
  });

  it("returns an empty list with a warning if the history API fails", async () => {
    requestMock.mockRejectedValueOnce(new Error("history not enabled"));
    const res = await request(app).get("/api/admin/posts/doc-event-1/revisions");
    expect(res.status).toBe(200);
    expect(res.body.revisions).toEqual([]);
    expect(res.body.warning).toMatch(/history/i);
  });
});

describe("Presence /api/admin/posts/:id/presence", () => {
  it("requires a session for heartbeat", async () => {
    state.currentUserId = undefined;
    const res = await request(app).post("/api/admin/posts/doc-event-1/presence").send({});
    expect(res.status).toBe(401);
  });

  it("rejects malformed ids", async () => {
    const res = await request(app).post("/api/admin/posts/has%20space/presence").send({});
    expect(res.status).toBe(400);
  });

  it("returns no others when the current user is the only editor", async () => {
    const res = await request(app).post("/api/admin/posts/presence-solo/presence").send({});
    expect(res.status).toBe(200);
    expect(res.body.others).toEqual([]);
  });

  it("lists other concurrent editors and clears them on DELETE", async () => {
    state.currentUserId = "user_alice";
    await request(app).post("/api/admin/posts/presence-pair/presence").send({});

    state.currentUserId = "user_bob";
    const join = await request(app).post("/api/admin/posts/presence-pair/presence").send({});
    expect(join.status).toBe(200);
    expect(join.body.others).toHaveLength(1);
    expect(join.body.others[0]).toMatchObject({ id: "user_alice", name: "Ada Lovelace" });

    state.currentUserId = "user_alice";
    const leave = await request(app).delete("/api/admin/posts/presence-pair/presence");
    expect(leave.status).toBe(200);

    state.currentUserId = "user_bob";
    const after = await request(app).post("/api/admin/posts/presence-pair/presence").send({});
    expect(after.body.others).toEqual([]);
  });
});

describe("POST /api/admin/posts/:id/restore", () => {
  it("returns 401 without a session", async () => {
    state.currentUserId = undefined;
    const res = await request(app)
      .post("/api/admin/posts/doc-event-1/restore")
      .send({ revisionId: "tx-1" });
    expect(res.status).toBe(401);
  });

  it("rejects bad revisionId", async () => {
    const res = await request(app)
      .post("/api/admin/posts/doc-event-1/restore")
      .send({ revisionId: "not valid!" });
    expect(res.status).toBe(400);
    expect(createOrReplaceMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the live document does not exist", async () => {
    const res = await request(app)
      .post("/api/admin/posts/missing-id/restore")
      .send({ revisionId: "tx-1" });
    expect(res.status).toBe(404);
    expect(createOrReplaceMock).not.toHaveBeenCalled();
  });

  it("refuses to restore non-post documents", async () => {
    const res = await request(app)
      .post("/api/admin/posts/doc-author-1/restore")
      .send({ revisionId: "tx-1" });
    expect(res.status).toBe(400);
    expect(createOrReplaceMock).not.toHaveBeenCalled();
  });

  it("createOrReplaces the live doc with the historical one and stamps editor", async () => {
    requestMock.mockResolvedValueOnce({
      documents: [
        {
          _id: "doc-event-1",
          _type: "event",
          _rev: "old-rev",
          _createdAt: "2026-01-01T00:00:00Z",
          _updatedAt: "2026-04-10T00:00:00Z",
          title: "Old title",
          startsAt: "2026-05-01T00:00:00Z",
        },
      ],
    });
    const res = await request(app)
      .post("/api/admin/posts/doc-event-1/restore")
      .send({ revisionId: "tx-old" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, id: "doc-event-1", revisionId: "tx-old" });
    expect(createOrReplaceMock).toHaveBeenCalledTimes(1);
    const arg = createOrReplaceMock.mock.calls[0][0] as Record<string, unknown>;
    expect(arg._id).toBe("doc-event-1");
    expect(arg._type).toBe("event");
    expect(arg._rev).toBeUndefined();
    expect(arg._updatedAt).toBeUndefined();
    expect(arg.title).toBe("Old title");
    expect(arg.lastEditedAt).toEqual(expect.any(String));
    expect(arg.lastEditedBy).toEqual({ id: "user_admin", name: "Ada Lovelace" });
  });

  it("rejects restoring a revision whose type doesn't match the live doc", async () => {
    requestMock.mockResolvedValueOnce({
      documents: [{ _id: "doc-event-1", _type: "blog", title: "Wrong" }],
    });
    const res = await request(app)
      .post("/api/admin/posts/doc-event-1/restore")
      .send({ revisionId: "tx-old" });
    expect(res.status).toBe(400);
    expect(createOrReplaceMock).not.toHaveBeenCalled();
  });
});
