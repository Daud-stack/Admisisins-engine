import { describe, it, expect } from "bun:test";
import { cn } from "../utils";

describe("cn utility function", () => {
  it("should merge basic class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle tailwind conflict resolution (twMerge)", () => {
    // text-red-500 should be overwritten by text-blue-500
    expect(cn("px-2 text-red-500", "text-blue-500")).toBe("px-2 text-blue-500");
    // p-2 should be overwritten by p-4
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("should handle conditional classes (clsx)", () => {
    expect(cn("base-class", true && "active", false && "inactive")).toBe("base-class active");
  });

  it("should handle array inputs", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  it("should ignore falsy values", () => {
    expect(cn("class1", null, undefined, false, 0, "", "class2")).toBe("class1 class2");
  });

  it("should handle object inputs", () => {
    expect(cn("class1", { "class2": true, "class3": false })).toBe("class1 class2");
  });

  it("should handle complex combinations", () => {
    const isActive = true;
    const hasError = false;
    expect(
      cn(
        "base-btn",
        "px-4 py-2",
        {
          "bg-blue-500 text-white": isActive,
          "bg-red-500 text-white": hasError,
        },
        ["rounded-md", "shadow-sm"],
        "text-lg text-sm" // twMerge should resolve this to just text-sm
      )
    ).toBe("base-btn px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm text-sm");
  });
});
