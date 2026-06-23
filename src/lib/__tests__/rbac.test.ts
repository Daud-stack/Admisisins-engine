import { describe, expect, test } from "bun:test";
import { checkPermission } from "../rbac";

describe("checkPermission", () => {
  test("returns false for undefined or empty string roles", () => {
    expect(checkPermission(undefined, "/dashboard")).toBe(false);
    expect(checkPermission("", "/dashboard")).toBe(false);
  });

  test("allows ADMIN access to any path", () => {
    expect(checkPermission("ADMIN", "/dashboard")).toBe(true);
    expect(checkPermission("ADMIN", "/settings")).toBe(true);
    expect(checkPermission("ADMIN", "/unknown-path")).toBe(true);
  });

  test("handles exact path matching correctly based on permission matrix", () => {
    // CLERK can access /dashboard and /qc, but not /analytics
    expect(checkPermission("CLERK", "/dashboard")).toBe(true);
    expect(checkPermission("CLERK", "/qc")).toBe(true);
    expect(checkPermission("CLERK", "/analytics")).toBe(false);

    // SUPERVISOR can access /analytics
    expect(checkPermission("SUPERVISOR", "/analytics")).toBe(true);
  });

  test("allows access for sub-paths of defined routes", () => {
    // /settings requires ADMIN
    expect(checkPermission("ADMIN", "/settings/profile")).toBe(true);
    expect(checkPermission("CLERK", "/settings/profile")).toBe(false);

    // /qc requires CLERK, SUPERVISOR, or ADMIN
    expect(checkPermission("CLERK", "/qc/new")).toBe(true);
    expect(checkPermission("MANAGER", "/qc/new")).toBe(false);
  });

  test("handles lowercase role strings", () => {
    expect(checkPermission("clerk", "/dashboard")).toBe(true);
    expect(checkPermission("manager", "/analytics")).toBe(true);
    expect(checkPermission("admin", "/settings")).toBe(true);
  });

  test("returns true for unlisted routes by default", () => {
    expect(checkPermission("CLERK", "/unlisted-route")).toBe(true);
    expect(checkPermission("MANAGER", "/public-page")).toBe(true);
  });
});
