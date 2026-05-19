"""
Role-Based Access Control (RBAC) Permissions System
====================================================
Defines all permissions, role-permission mappings, and provides
dependency injection for permission checking in FastAPI routes.
"""

from typing import Dict, List, Set
from fastapi import HTTPException, status


# - All Defined Permissions
# Format: "resource:action" - follows a consistent naming convention.

PERMISSIONS = {
    # Auth & Account
    "auth:login", "auth:register", "auth:logout", "auth:refresh",
    "auth:forgot_password", "auth:reset_password", "auth:verify_email",
    "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
    # User Profile
    "users:read_own", "users:update_own", "users:upload_avatar",
    "users:manage_settings", "users:read_any", "users:update_any",
    "users:delete_any", "users:manage_roles", "users:ban",
    # Jobs
    "jobs:read_public", "jobs:read_private", "jobs:apply",
    "jobs:save", "jobs:unsave", "jobs:view_applications",
    "jobs:create", "jobs:update_own", "jobs:delete_own",
    "jobs:update_any", "jobs:delete_any", "jobs:feature", "jobs:manage_applications",
    # Companies
    "companies:create", "companies:read_public", "companies:read_own",
    "companies:update_own", "companies:verify",
    # Projects
    "projects:read_public", "projects:read_private", "projects:create",
    "projects:update_own", "projects:delete_own", "projects:like",
    "projects:save", "projects:comment",
    # Learning
    "learning:read", "learning:enroll", "learning:complete",
    "learning:track_progress", "learning:manage_courses",
    # Blogs
    "blogs:read", "blogs:create", "blogs:update_own", "blogs:delete_own", "blogs:moderate",
    # Templates
    "templates:read_public", "templates:read_private", "templates:create",
    "templates:update_own", "templates:delete_own", "templates:approve",
    "templates:purchase", "templates:review",
    # Payments
    "payments:read", "payments:create", "payments:refund", "payments:manage_subscriptions",
    # Interviews
    "interviews:read", "interviews:attempt", "interviews:review", "interviews:manage",
    # Proctoring
    "proctoring:read", "proctoring:create", "proctoring:manage", "proctoring:review",
    # Analytics & Reports
    "analytics:read", "analytics:export", "reports:read", "reports:generate",
    # Notifications
    "notifications:read", "notifications:manage",
    # Admin
    "admin:dashboard", "admin:users", "admin:settings", "admin:audit_logs",
    "admin:moderation", "admin:content",
    # Platform
    "platform:health", "platform:config", "platform:features",
}

# - Role Permissions Mapping

ROLE_PERMISSIONS = {
    "anonymous": {
        "auth:login", "auth:register", "auth:forgot_password",
        "auth:reset_password", "auth:verify_email", "jobs:read_public",
        "companies:read_public", "projects:read_public", "learning:read",
        "blogs:read", "templates:read_public", "interviews:read", "platform:health",
    },
    "job_seeker": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "jobs:read_public", "jobs:read_private",
        "jobs:apply", "jobs:save", "jobs:unsave", "jobs:view_applications",
        "companies:read_public", "projects:read_public", "learning:read",
        "learning:enroll", "learning:complete", "learning:track_progress",
        "blogs:read", "templates:read_public", "templates:purchase",
        "interviews:read", "interviews:attempt",
        "notifications:read", "notifications:manage", "platform:health",
    },
    "professional": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "jobs:read_public", "jobs:read_private",
        "jobs:apply", "jobs:save", "jobs:unsave", "jobs:view_applications",
        "companies:read_public", "projects:read_public", "projects:create",
        "projects:update_own", "projects:delete_own", "projects:like",
        "projects:save", "projects:comment", "learning:read", "learning:enroll",
        "learning:complete", "learning:track_progress", "blogs:read",
        "templates:read_public", "templates:purchase", "interviews:read",
        "interviews:attempt", "interviews:review", "analytics:read",
        "notifications:read", "notifications:manage", "platform:health",
    },
    "creator": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "jobs:read_public", "jobs:read_private",
        "jobs:apply", "jobs:save", "jobs:unsave", "jobs:view_applications",
        "companies:read_public", "projects:read_public", "projects:create",
        "projects:update_own", "projects:delete_own", "projects:like",
        "projects:save", "projects:comment", "learning:read", "learning:enroll",
        "learning:complete", "learning:track_progress", "learning:manage_courses",
        "blogs:read", "blogs:create", "blogs:update_own", "blogs:delete_own",
        "templates:read_public", "templates:read_private", "templates:create",
        "templates:update_own", "templates:delete_own", "templates:purchase",
        "templates:review", "payments:read", "payments:create",
        "payments:manage_subscriptions", "interviews:read", "interviews:attempt",
        "interviews:review", "analytics:read",
        "notifications:read", "notifications:manage", "platform:health",
    },
    "freelancer": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "jobs:read_public", "jobs:read_private",
        "jobs:apply", "jobs:save", "jobs:unsave", "jobs:view_applications",
        "companies:read_public", "projects:read_public", "projects:create",
        "projects:update_own", "projects:delete_own", "projects:like",
        "projects:save", "projects:comment", "learning:read", "learning:enroll",
        "learning:complete", "learning:track_progress", "blogs:read",
        "blogs:create", "blogs:update_own", "blogs:delete_own",
        "templates:read_public", "templates:read_private", "templates:create",
        "templates:update_own", "templates:delete_own", "templates:purchase",
        "templates:review", "payments:read", "payments:create",
        "payments:manage_subscriptions", "interviews:read", "interviews:attempt",
        "interviews:review", "analytics:read",
        "notifications:read", "notifications:manage", "platform:health",
    },
    "founder": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "jobs:read_public", "jobs:read_private",
        "jobs:apply", "jobs:save", "jobs:unsave", "jobs:view_applications",
        "companies:read_public", "companies:create", "companies:read_own",
        "companies:update_own", "projects:read_public", "projects:create",
        "projects:update_own", "projects:delete_own", "projects:like",
        "projects:save", "projects:comment", "learning:read", "learning:enroll",
        "learning:complete", "learning:track_progress", "blogs:read",
        "blogs:create", "blogs:update_own", "blogs:delete_own",
        "templates:read_public", "templates:read_private", "templates:create",
        "templates:update_own", "templates:delete_own", "templates:purchase",
        "templates:review", "payments:read", "payments:create",
        "payments:manage_subscriptions", "interviews:read", "interviews:attempt",
        "interviews:review", "analytics:read", "reports:read",
        "notifications:read", "notifications:manage", "platform:health",
    },
    "enterprise": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "jobs:read_public", "jobs:read_private",
        "jobs:apply", "jobs:save", "jobs:unsave", "jobs:view_applications",
        "jobs:manage_applications", "companies:read_public", "companies:create",
        "companies:read_own", "companies:update_own", "companies:verify",
        "projects:read_public", "projects:create", "projects:update_own",
        "projects:delete_own", "projects:like", "projects:save", "projects:comment",
        "learning:read", "learning:enroll", "learning:complete",
        "learning:track_progress", "learning:manage_courses", "blogs:read",
        "blogs:create", "blogs:update_own", "blogs:delete_own",
        "templates:read_public", "templates:read_private", "templates:create",
        "templates:update_own", "templates:delete_own", "templates:purchase",
        "templates:review", "payments:read", "payments:create",
        "payments:manage_subscriptions", "interviews:read", "interviews:attempt",
        "interviews:review", "interviews:manage", "analytics:read",
        "reports:read", "reports:generate", "notifications:read",
        "notifications:manage", "admin:dashboard", "admin:users",
        "admin:audit_logs", "admin:moderation", "platform:health",
    },
    "instructor": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "jobs:read_public", "jobs:save",
        "companies:read_public", "projects:read_public", "learning:read",
        "learning:enroll", "learning:complete", "learning:track_progress",
        "learning:manage_courses", "blogs:read", "blogs:create",
        "blogs:update_own", "blogs:delete_own", "templates:read_public",
        "templates:purchase", "interviews:read", "interviews:attempt",
        "interviews:review", "interviews:manage", "analytics:read",
        "notifications:read", "notifications:manage", "platform:health",
    },
    "recruiter": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "jobs:read_public", "jobs:read_private",
        "jobs:save", "jobs:unsave", "jobs:view_applications", "jobs:create",
        "jobs:update_own", "jobs:delete_own", "jobs:manage_applications",
        "companies:read_public", "companies:create", "companies:read_own",
        "companies:update_own", "projects:read_public", "learning:read",
        "blogs:read", "templates:read_public", "interviews:read",
        "interviews:review", "interviews:manage", "analytics:read",
        "notifications:read", "notifications:manage", "platform:health",
    },
    "admin": {
        "auth:login", "auth:register", "auth:logout", "auth:refresh",
        "auth:forgot_password", "auth:reset_password", "auth:verify_email",
        "auth:verify_phone", "auth:enable_2fa", "auth:disable_2fa", "auth:verify_2fa",
        "users:read_own", "users:update_own", "users:upload_avatar",
        "users:manage_settings", "users:read_any", "users:update_any",
        "users:delete_any", "users:manage_roles", "users:ban",
        "jobs:read_public", "jobs:read_private", "jobs:apply", "jobs:save",
        "jobs:unsave", "jobs:view_applications", "jobs:create",
        "jobs:update_own", "jobs:delete_own", "jobs:update_any",
        "jobs:delete_any", "jobs:feature", "jobs:manage_applications",
        "companies:read_public", "companies:create", "companies:read_own",
        "companies:update_own", "companies:verify", "projects:read_public",
        "projects:read_private", "projects:create", "projects:update_own",
        "projects:delete_own", "projects:like", "projects:save", "projects:comment",
        "learning:read", "learning:enroll", "learning:complete",
        "learning:track_progress", "learning:manage_courses", "blogs:read",
        "blogs:create", "blogs:update_own", "blogs:delete_own", "blogs:moderate",
        "templates:read_public", "templates:read_private", "templates:create",
        "templates:update_own", "templates:delete_own", "templates:approve",
        "templates:purchase", "templates:review", "payments:read",
        "payments:create", "payments:refund", "payments:manage_subscriptions",
        "interviews:read", "interviews:attempt", "interviews:review",
        "interviews:manage", "proctoring:read", "proctoring:create",
        "proctoring:manage", "proctoring:review", "analytics:read",
        "analytics:export", "reports:read", "reports:generate",
        "notifications:read", "notifications:manage", "admin:dashboard",
        "admin:users", "admin:settings", "admin:audit_logs",
        "admin:moderation", "admin:content", "platform:health",
        "platform:config", "platform:features",
    },
}

# - Role Hierarchy (inheritance)

ROLE_HIERARCHY = [
    "anonymous", "job_seeker", "professional", "creator",
    "freelancer", "founder", "enterprise", "instructor",
    "recruiter", "admin",
]


def get_all_permissions_for_role(role):
    """Get all permissions for a role including inherited ones."""
    if role not in ROLE_PERMISSIONS:
        role = "anonymous"
    all_permissions = set()
    for r in ROLE_HIERARCHY:
        all_permissions.update(ROLE_PERMISSIONS.get(r, set()))
        if r == role:
            break
    return all_permissions


def has_permission(user, required_permission):
    """Check if a user has a specific permission."""
    if not user:
        return False
    if user.get("is_superadmin"):
        return True
    role = user.get("role", "anonymous")
    all_perms = get_all_permissions_for_role(role)
    extra_perms = user.get("permissions", [])
    if extra_perms:
        all_perms.update(extra_perms)
    return required_permission in all_perms


def require_permission(permission):
    """FastAPI dependency for permission checking."""
    def _check(current_user):
        if not has_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: '{}' required".format(permission)
            )
        return current_user
    return _check


# Built-in role sets
JOB_MANAGER_ROLES = {"company", "admin", "enterprise", "recruiter"}
CONTENT_MANAGER_ROLES = {"creator", "admin", "enterprise", "instructor"}
ADMIN_ROLES = {"admin"}
MODERATOR_ROLES = {"admin", "enterprise"}


def require_role(*allowed_roles):
    """FastAPI dependency for role checking."""
    def _check(current_user):
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        user_role = current_user.get("role", "")
        if user_role not in allowed_roles and not current_user.get("is_superadmin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access requires one of these roles: {}".format(allowed_roles)
            )
        return current_user
    return _check
