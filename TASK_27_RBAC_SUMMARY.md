# Task 27: Role-based Access Control (admin/staff)

Status: Completed

Deliverables:
- RBAC enum extended in database to include `admin` and `staff` (migration: `supabase/migrations/20250830_add_admin_staff_roles.sql`).
- Canonical admin check updated to use `clients.role` and treat `owner` as admin-equivalent (`lib/flags/server.ts:isAdmin`).
- Admin API to update a user role (owners/admins only): `POST /api/admin/users/role` with `{ targetUserId, role }`.
- UI conditional: global nav now shows quick Admin access link for `admin`/`owner` roles only.
- Unit tests covering role permissions and resolution: `tests/auth/roles.test.ts`.

Notes:
- Existing guards (`requirePermission`, `requireRole`) continue to enforce access throughout the app.
- Owners are the only role allowed to assign the `owner` role and to modify another owner.
- Staff retains read/write with limited management capabilities consistent with `ROLE_PERMISSIONS`.

