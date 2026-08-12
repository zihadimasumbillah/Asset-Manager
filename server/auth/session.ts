import crypto from "crypto";

import type { Request, Response, NextFunction } from "express";

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(64).toString("hex");
const SESSION_NAME = "finpulse.sid";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionUser {
  id: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: SessionUser;
}

export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers["x-session-id"];
  if (typeof sessionId === "string" && sessionId.length > 0) {
    req.headers["cookie"] = `${SESSION_NAME}=${sessionId}; Path=/; HttpOnly; Max-Age=${SESSION_MAX_AGE}`;
  }
  next();
}

export function generateSessionKey(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashSessionKey(key: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(key).digest("hex");
}

export function validateSessionKey(key: string): boolean {
  if (!key || key.length < 32) return false;
  try {
    const parts = key.split(".");
    if (parts.length !== 2) return false;
    const [raw, hash] = parts;
    if (!raw || !hash) return false;
    const expectedHash = hashSessionKey(raw);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
  } catch {
    return false;
  }
}

export function getUserIdFromSession(key: string): string | null {
  if (!validateSessionKey(key)) return null;
  const parts = key.split(".");
  if (parts.length !== 2) return null;
  const decoded = Buffer.from(parts[0], "hex").toString("utf-8");
  if (!decoded.startsWith("user:")) return null;
  return decoded.slice(5);
}

export function createSessionKey(userId: string): string {
  const raw = `user:${userId}`;
  const rawHex = Buffer.from(raw, "utf-8").toString("hex");
  const hash = hashSessionKey(rawHex);
  return `${rawHex}.${hash}`;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const sessionKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  
  if (!sessionKey) {
    return res.status(401).json({ message: "Unauthorized: Session key required." });
  }

  const userId = getUserIdFromSession(sessionKey);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: Invalid session key." });
  }

  req.user = { id: userId, username: userId };
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const sessionKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  
  if (sessionKey) {
    const userId = getUserIdFromSession(sessionKey);
    if (userId) {
      req.user = { id: userId, username: userId };
    }
  }
  
  next();
}
