import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-2 py-1", "bg-blue-500", { "text-white": true, hidden: false });
    expect(result).toBe("px-2 py-1 bg-blue-500 text-white");
  });

  it("should resolve tailwind conflict classes", () => {
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });
});
