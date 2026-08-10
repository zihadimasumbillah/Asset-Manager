import { describe, expect, it } from "vitest";

import { AppError, toClientError } from "./errors";

describe("errors utility module", () => {
  describe("AppError", () => {
    it("should instantiate with correct statusCode and message", () => {
      const error = new AppError(404, "Report not found");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Report not found");
      expect(error.name).toBe("AppError");
    });
  });

  describe("toClientError", () => {
    it("should return the exact status and message for AppError instances", () => {
      const appErr = new AppError(400, "Invalid file format");
      const clientErr = toClientError(appErr);
      expect(clientErr).toEqual({
        status: 400,
        message: "Invalid file format",
      });
    });

    it("should return generic 500 status for unknown/standard Error instances", () => {
      const stdErr = new Error("Database connection dropped");
      const clientErr = toClientError(stdErr);
      expect(clientErr).toEqual({
        status: 500,
        message: "An unexpected error occurred.",
      });
    });

    it("should return generic 500 status for string or undefined throwables", () => {
      expect(toClientError("raw string error")).toEqual({
        status: 500,
        message: "An unexpected error occurred.",
      });
      expect(toClientError(null)).toEqual({
        status: 500,
        message: "An unexpected error occurred.",
      });
    });
  });
});
