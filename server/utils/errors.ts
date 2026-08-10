/**
 * AppError — a deliberate, user-facing error that carries an HTTP status code.
 *
 * Rules:
 * - Only throw AppError when you want the message surfaced to the client.
 * - All other (unexpected) errors are caught and converted to a generic 500 by toClientError().
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
    // Maintains proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * toClientError — converts any thrown value into a safe, client-facing message.
 *
 * - AppError: expose statusCode and message (these are deliberate)
 * - Everything else: log internally and return a generic message to avoid
 *   leaking DB error messages, stack traces, or internal topology.
 */
export function toClientError(error: unknown): { status: number; message: string } {
  if (error instanceof AppError) {
    return { status: error.statusCode, message: error.message };
  }
  // Do NOT leak internals. The caller must have already console.error'd.
  return { status: 500, message: "An unexpected error occurred." };
}
