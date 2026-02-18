/**
 * Permission types for RBAC system
 */

export type Resource =
  | 'users'
  | 'lessons'
  | 'quizzes'
  | 'exercises'
  | 'flashcards'
  | 'content'
  | 'analytics'
  | 'settings'
  | 'roles';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface Permission {
  resource: Resource;
  actions: Action[];
}

export interface Role {
  name: 'student' | 'instructor' | 'admin';
  permissions: Permission[];
}

/**
 * Predefined permissions for each role
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  student: [
    { resource: 'lessons', actions: ['read'] },
    { resource: 'quizzes', actions: ['read', 'update'] },
    { resource: 'exercises', actions: ['read', 'update'] },
    { resource: 'flashcards', actions: ['read', 'update'] },
    { resource: 'settings', actions: ['read', 'update'] },
  ],
  instructor: [
    { resource: 'lessons', actions: ['read', 'create', 'update'] },
    { resource: 'quizzes', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'exercises', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'flashcards', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'content', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] },
  ],
  admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'lessons', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'quizzes', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'exercises', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'flashcards', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'content', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'analytics', actions: ['read', 'manage'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
  ],
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: string,
  resource: Resource,
  action: Action
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const resourcePermission = permissions.find((p) => p.resource === resource);
  if (!resourcePermission) return false;

  return (
    resourcePermission.actions.includes(action) ||
    resourcePermission.actions.includes('manage')
  );
}
