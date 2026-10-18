-- =============================================================================
-- Flyway Migration: V6__seed_rbac_permissions.sql
-- Description: Seed enterprise RBAC permissions for digital banking matrix
-- =============================================================================

-- 1. Insert standard RBAC permissions
INSERT INTO permissions (id, permission_code, permission_name)
VALUES
    (gen_random_uuid(), 'CUSTOMER_READ', 'View customer 360 profile'),
    (gen_random_uuid(), 'KYC_VERIFY', 'Approve or reject customer eKYC documents'),
    (gen_random_uuid(), 'ACCOUNT_FREEZE', 'Freeze customer payment account'),
    (gen_random_uuid(), 'ACCOUNT_UNFREEZE', 'Unfreeze customer payment account'),
    (gen_random_uuid(), 'CASH_DEPOSIT', 'Cash deposit at counter'),
    (gen_random_uuid(), 'CASH_WITHDRAW', 'Cash withdrawal at counter'),
    (gen_random_uuid(), 'ROLLBACK_REQUEST', 'Initiate transaction rollback request'),
    (gen_random_uuid(), 'ROLLBACK_APPROVE', 'Approve transaction rollback request'),
    (gen_random_uuid(), 'EMPLOYEE_MANAGE', 'Manage internal employee accounts'),
    (gen_random_uuid(), 'ROLE_MANAGE', 'Manage system roles and RBAC permissions'),
    (gen_random_uuid(), 'SCHEDULER_MANAGE', 'Control background cron scheduler engine'),
    (gen_random_uuid(), 'CACHE_EVICT', 'Manage and evict Redis cache'),
    (gen_random_uuid(), 'SYSTEM_CONFIG', 'Modify system configuration parameters'),
    (gen_random_uuid(), 'AUDIT_LOG_VIEW', 'View security and audit log entries')
ON CONFLICT (permission_code) DO NOTHING;

-- 2. Assign default banking counter permissions to ROLE_TELLER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_code = 'ROLE_TELLER'
  AND p.permission_code IN ('CUSTOMER_READ', 'KYC_VERIFY', 'ACCOUNT_FREEZE', 'ACCOUNT_UNFREEZE', 'CASH_DEPOSIT', 'CASH_WITHDRAW')
ON CONFLICT DO NOTHING;

-- 3. Assign all permissions to ROLE_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_code = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;
