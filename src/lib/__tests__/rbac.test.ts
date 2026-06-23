import { describe, expect, test } from "bun:test";
import { getAllowedRoutes, PERMISSION_MATRIX } from "../rbac";

describe("getAllowedRoutes", () => {
  test("returns an empty array when role is undefined", () => {
    expect(getAllowedRoutes(undefined)).toEqual([]);
  });

  test("returns an empty array when role is an empty string", () => {
    expect(getAllowedRoutes("")).toEqual([]);
  });

  test("returns correct routes for the CLERK role", () => {
    const clerkRoutes = getAllowedRoutes("CLERK");
    expect(clerkRoutes.length).toBeGreaterThan(0);
    clerkRoutes.forEach(route => {
      expect(route.roles).toContain("CLERK");
    });
  });

  test("returns correct routes for the ADMIN role", () => {
    const adminRoutes = getAllowedRoutes("ADMIN");
    // Admin should have access to everything based on matrix
    expect(adminRoutes.length).toBe(PERMISSION_MATRIX.length);
    adminRoutes.forEach(route => {
      expect(route.roles).toContain("ADMIN");
    });
  });

  test("returns correct routes for the MANAGER role", () => {
    const managerRoutes = getAllowedRoutes("MANAGER");
    expect(managerRoutes.length).toBeGreaterThan(0);
    managerRoutes.forEach(route => {
      expect(route.roles).toContain("MANAGER");
    });
  });

  test("returns correct routes for the SUPERVISOR role", () => {
    const supervisorRoutes = getAllowedRoutes("SUPERVISOR");
    expect(supervisorRoutes.length).toBeGreaterThan(0);
    supervisorRoutes.forEach(route => {
      expect(route.roles).toContain("SUPERVISOR");
    });
  });

  test("returns empty array for invalid roles", () => {
    expect(getAllowedRoutes("INVALID_ROLE")).toEqual([]);
  });
});
