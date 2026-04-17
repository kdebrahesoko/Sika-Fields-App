import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export interface AdminRequest extends Request {
  userId?: string;
}

export const requireAuth = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
};

export const requireAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const user = await clerkClient.users.getUser(userId);
    const role = (user.publicMetadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    req.userId = userId;
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    res.status(500).json({ error: "Failed to verify admin role" });
  }
};
