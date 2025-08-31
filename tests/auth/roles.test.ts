import { ROLE_PERMISSIONS, USER_ROLES, hasPermission, getUserRole } from '@/lib/auth/roles'

describe('RBAC: roles and permissions', () => {
  test('permissions mapping for admin and staff', () => {
    expect(ROLE_PERMISSIONS.admin.canRead).toBe(true)
    expect(ROLE_PERMISSIONS.admin.canWrite).toBe(true)
    expect(ROLE_PERMISSIONS.admin.canDelete).toBe(true)
    expect(ROLE_PERMISSIONS.admin.canManageUsers).toBe(true)
    expect(ROLE_PERMISSIONS.admin.canManageSettings).toBe(true)

    expect(ROLE_PERMISSIONS.staff.canRead).toBe(true)
    expect(ROLE_PERMISSIONS.staff.canWrite).toBe(true)
    expect(ROLE_PERMISSIONS.staff.canDelete).toBe(false)
    expect(ROLE_PERMISSIONS.staff.canManageUsers).toBe(false)
    expect(ROLE_PERMISSIONS.staff.canManageSettings).toBe(false)
  })

  test('hasPermission checks', () => {
    expect(hasPermission(USER_ROLES.ADMIN, 'canManageUsers')).toBe(true)
    expect(hasPermission(USER_ROLES.STAFF, 'canManageUsers')).toBe(false)
    expect(hasPermission(USER_ROLES.MEMBER, 'canWrite')).toBe(true)
    expect(hasPermission(USER_ROLES.VIEWER, 'canWrite')).toBe(false)
  })

  test('getUserRole returns highest priority', () => {
    // @ts-expect-error minimal shape for test
    const user = { app_metadata: { roles: ['viewer', 'member', 'admin'] } }
    expect(getUserRole(user)).toBe('admin')
  })
})

