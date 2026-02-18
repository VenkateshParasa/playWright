import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { ROLE_PERMISSIONS } from '../../types/permissions.js';

/**
 * Get all roles and their permissions
 */
export async function getAllRoles(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const roles = Object.entries(ROLE_PERMISSIONS).map(([name, permissions]) => ({
      name,
      permissions,
    }));

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message,
    });
  }
}

/**
 * Get role by name
 */
export async function getRoleByName(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { name } = req.params;

    const permissions = ROLE_PERMISSIONS[name];
    if (!permissions) {
      res.status(404).json({
        success: false,
        message: 'Role not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        name,
        permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: error.message,
    });
  }
}
