import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();

router.use(requireAdmin);

router.get("/users", async (_req, res) => {
  try {
    const response = await clerkClient.users.getUserList({ limit: 200 });
    const users = response.data.map((u) => ({
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress ?? "",
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      imageUrl: u.imageUrl,
      role:
        ((u.publicMetadata as { role?: string } | undefined)?.role as string) ||
        "user",
      createdAt: u.createdAt,
      lastSignInAt: u.lastSignInAt,
    }));
    res.json({ users });
  } catch (err) {
    console.error("list users error:", err);
    res.status(500).json({ error: "Failed to list users" });
  }
});

router.post("/users/invite", async (req, res) => {
  const { email, role } = req.body as { email?: string; role?: string };
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: role === "admin" ? "admin" : "user" },
    });
    res.json({ invitation });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create invitation";
    console.error("invite user error:", err);
    res.status(400).json({ error: message });
  }
});

router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body as { role?: string };
  if (role !== "admin" && role !== "user") {
    res.status(400).json({ error: "Role must be 'admin' or 'user'" });
    return;
  }
  try {
    const updated = await clerkClient.users.updateUserMetadata(req.params.id, {
      publicMetadata: { role },
    });
    res.json({
      id: updated.id,
      role: (updated.publicMetadata as { role?: string }).role,
    });
  } catch (err) {
    console.error("update role error:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await clerkClient.users.deleteUser(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
