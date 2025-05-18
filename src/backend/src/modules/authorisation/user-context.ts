import { UserRole } from './enums/user-roles.enum';
import { Permission } from './enums/permissions.enum';
import { Logger } from '@nestjs/common';

/**
 * UserContext Class
 * 
 * Represents the security context of a user in the system.
 * This class encapsulates all authorisation-related information about a user,
 * including identity, assigned roles, and accessible controlled datasets.
 * It provides methods to check permissions and access rights for various operations.
 */
export class UserContext {
    /**
     * Creates a new UserContext instance.
     * 
     * @param userId - The unique identifier of the user, or null for unauthenticated users
     * @param roles - Array of user roles assigned to this user (defaults to PUBLIC_VISITOR)
     * @param controlledDatasetIds - Array of controlled dataset IDs the user has access to
     */
    constructor(
        public readonly userId: string | null,
        public readonly roles: UserRole[] = [UserRole.PUBLIC_VISITOR],
        public readonly controlledDatasetIds: number[] = []
    ) {
        Logger.log('UserContext created:', { userId, roles, controlledDatasetIds });
    }

    /**
     * Checks if the user has a specific role.
     * 
     * @param role - The role to check against user's assigned roles
     * @returns True if the user has the specified role, false otherwise
     */
    hasRole(role: UserRole): boolean {
        return this.roles.includes(role);
    }

    /**
     * Determines if the user has a specific permission based on their roles.
     * 
     * @param permission - The permission to check
     * @returns True if the user has the specified permission, false otherwise
     */
    hasPermission(permission: Permission): boolean {
        switch (permission) {
            case Permission.VIEW_PUBLIC_CONTENT:
                return true; // Everyone can view public content

            case Permission.VIEW_OWN_UNAPPROVED_CONTENT:
                return this.userId !== null; // Any authenticated user can view their own content

            case Permission.CREATE_UNAPPROVED_CONTENT:
            case Permission.EDIT_OWN_CONTENT:
                // These permissions are available to all authenticated users except public visitors
                return this.roles.some(role => [
                    UserRole.GENERAL_USER,
                    UserRole.CONTROLLED_DATASET_GRANTED_USER,
                    UserRole.CONTENT_OWNER,
                    UserRole.ADMIN
                ].includes(role));

            case Permission.VIEW_CONTROLLED_DATASET_DETAILS:
                // Only users with elevated roles can view controlled dataset details
                return this.roles.some(role => [
                    UserRole.CONTROLLED_DATASET_GRANTED_USER,
                    UserRole.CONTENT_OWNER,
                    UserRole.ADMIN
                ].includes(role));

            // Admin-only permissions
            case Permission.VIEW_ALL_UNAPPROVED_CONTENT:
            case Permission.CREATE_APPROVED_CONTENT:
            case Permission.APPROVE_CONTENT:
            case Permission.EDIT_ALL_CONTENT:
            case Permission.EDIT_HOMEPAGE_SETTINGS:
            case Permission.MANAGE_USERS:
                return this.roles.includes(UserRole.ADMIN);

            default:
                return false;
        }
    }
}