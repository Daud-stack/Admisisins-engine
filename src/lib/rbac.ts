/**
 * Role-Based Access Control (RBAC) Module
 * Defines the permission matrix and helpers for route-level authorization.
 */

export type UserRole = "CLERK" | "SUPERVISOR" | "MANAGER" | "ADMIN"

export interface RoutePermission {
  path: string
  label: string
  roles: UserRole[]
}

/**
 * Central permission matrix: maps each dashboard route to allowed roles.
 */
export const PERMISSION_MATRIX: RoutePermission[] = [
  { path: "/dashboard",   label: "Dashboard",        roles: ["CLERK", "SUPERVISOR", "MANAGER", "ADMIN"] },
  { path: "/qc",          label: "QC Entry",         roles: ["CLERK", "SUPERVISOR", "ADMIN"] },
  { path: "/tracker",     label: "Issue Tracker",    roles: ["CLERK", "SUPERVISOR", "MANAGER", "ADMIN"] },
  { path: "/analytics",   label: "Intelligence",     roles: ["SUPERVISOR", "MANAGER", "ADMIN"] },
  { path: "/ingest",      label: "Data Ingest",      roles: ["SUPERVISOR", "ADMIN"] },
  { path: "/signoffs",    label: "Sign-offs",        roles: ["SUPERVISOR", "ADMIN"] },
  { path: "/peer-review", label: "Peer Review",      roles: ["SUPERVISOR", "ADMIN"] },
  { path: "/leaderboard", label: "Leaderboard",      roles: ["CLERK", "SUPERVISOR", "MANAGER", "ADMIN"] },
  { path: "/predictive",  label: "Predictive Intel",  roles: ["SUPERVISOR", "MANAGER", "ADMIN"] },
  { path: "/financial",   label: "Financial Intel",   roles: ["MANAGER", "ADMIN"] },
  { path: "/management",  label: "Management",        roles: ["MANAGER", "ADMIN"] },
  { path: "/settings",    label: "Settings",          roles: ["ADMIN"] },
]

/**
 * Check if a given role has access to a specific route path.
 */
export function checkPermission(role: string | undefined, path: string): boolean {
  if (!role) return false
  
  const normalizedRole = role.toUpperCase() as UserRole
  
  // ADMIN always has access to everything
  if (normalizedRole === "ADMIN") return true
  
  const rule = PERMISSION_MATRIX.find(r => path.startsWith(r.path))
  if (!rule) return true // Unlisted routes are accessible by default
  
  return rule.roles.includes(normalizedRole)
}

/**
 * Get all routes a given role can access.
 */
export function getAllowedRoutes(role: string | undefined): RoutePermission[] {
  if (!role) return []
  const normalizedRole = role.toUpperCase() as UserRole
  return PERMISSION_MATRIX.filter(r => r.roles.includes(normalizedRole))
}

/**
 * Role hierarchy levels for display and comparison.
 */
export const ROLE_HIERARCHY: Record<UserRole, { level: number; label: string; color: string }> = {
  CLERK:      { level: 1, label: "Station Clerk",      color: "text-blue-400" },
  SUPERVISOR: { level: 2, label: "Shift Supervisor",   color: "text-primary" },
  MANAGER:    { level: 3, label: "Operations Manager", color: "text-warn" },
  ADMIN:      { level: 4, label: "System Administrator", color: "text-danger" },
}
