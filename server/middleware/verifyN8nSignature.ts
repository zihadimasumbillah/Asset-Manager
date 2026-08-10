import crypto from "crypto";

import type { NextFunction, Request, Response } from "express";

/**
 * verifyN8nSignature — Express middleware that validates the HMAC-SHA256 signature
 * on incoming n8n webhook requests.
 *
 * n8n must be configured to send the header:
 *   x-n8n-signature: sha256=<hex-digest>
 *
 * The shared secret must match N8N_WEBHOOK_SECRET in both environments.
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
export function verifyN8nSignature(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!secret) {
    // Fail closed — a missing secret is a misconfiguration, not a client error.
    console.error(
      "[webhook] FATAL: N8N_WEBHOOK_SECRET is not set. Webhook endpoint is unprotected. " +
        "Set the env var immediately."
    );
    res.status(500).json({ message: "Server misconfiguration: webhook secret not configured." });
    return;
  }

  const signatureHeader = req.get("x-n8n-signature");
  if (!signatureHeader) {
    res.status(401).json({ message: "Missing x-n8n-signature header." });
    return;
  }

  // rawBody is set by the express.json verify callback in index.ts
  const rawBody = req.rawBody;
  if (!Buffer.isBuffer(rawBody) || rawBody.length === 0) {
    res.status(400).json({ message: "Cannot verify signature: raw body unavailable." });
    return;
  }

  const rawSignature = signatureHeader.replace(/^sha256=/, "").trim();
  const computedDigest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  // timingSafeEqual prevents timing-based attacks that compare byte-by-byte
  try {
    const expectedBuf = Buffer.from(computedDigest, "utf8");
    const receivedBuf = Buffer.from(rawSignature, "utf8");

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      res.status(401).json({ message: "Invalid webhook signature." });
      return;
    }
  } catch {
    // timingSafeEqual throws if buffers differ in type — treat as invalid
    res.status(401).json({ message: "Invalid webhook signature." });
    return;
  }

  next();
}
