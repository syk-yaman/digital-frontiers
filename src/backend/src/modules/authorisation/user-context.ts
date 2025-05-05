import { UserRole } from './enums/user-roles.enum';
import { Permission } from './enums/permissions.enum';

export class UserContext {
    constructor(
        public readonly userId: string | null,
        public readonly roles: UserRole[] = [UserRole.PUBLIC],
        public readonly controlledDatasetIds: string[] = []
    ) { }

    hasRole(role: UserRole): boolean {
        return this.roles.includes(role);
    }

    hasPermission(permission: Permission): boolean {
        switch (permission) {
            case Permission.VIEW_PUBLIC_CONTENT:
                return true; // Everyone can view public content

            case Permission.VIEW_OWN_UNAPPROVED_CONTENT:
                return this.userId !== null; // Any authenticated user can view their own content

            case Permission.CREATE_UNAPPROVED_CONTENT:
            case Permission.EDIT_OWN_CONTENT:
            case Permission.CREATE_CONTROLLED_DATASETS:
                return this.roles.some(role => [
                    UserRole.USER,
                    UserRole.CONTROLLED_DATASET_USER,
                    UserRole.CONTENT_OWNER,
                    UserRole.ADMIN
                ].includes(role));

            case Permission.VIEW_CONTROLLED_DATASETS:
                return this.roles.some(role => [
                    UserRole.CONTROLLED_DATASET_USER,
                    UserRole.CONTENT_OWNER,
                    UserRole.ADMIN
                ].includes(role));

            case Permission.EDIT_CONTROLLED_DATASETS:
                return this.roles.some(role => [
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

    canViewDataset(dataset: { id: string; isControlled: boolean; ownerId: string; isApproved: boolean }): boolean {
        // If user is the owner, they can view their dataset regardless of approval status
        if (this.userId === dataset.ownerId) {
            return true;
        }

        // Admins can view any dataset
        if (this.hasPermission(Permission.VIEW_ALL_UNAPPROVED_CONTENT)) {
            return true;
        }

        // For non-owners, the dataset must be approved
        if (!dataset.isApproved) {
            return false;
        }

        // For public datasets that are approved, anyone can view
        if (!dataset.isControlled) {
            return true;
        }

        // For controlled datasets that are approved, only users with specific access can view
        return this.controlledDatasetIds.includes(dataset.id);
    }

    canEditDataset(dataset: { ownerId: string; isControlled: boolean }): boolean {
        // Admin can edit anything
        if (this.hasPermission(Permission.EDIT_ALL_CONTENT)) {
            return true;
        }

        // Users can edit their own content
        if (this.userId === dataset.ownerId) {
            return true;
        }

        // Content owners with controlled dataset permission can edit controlled datasets
        if (dataset.isControlled &&
            this.hasPermission(Permission.EDIT_CONTROLLED_DATASETS)) {
            return true;
        }

        return false;
    }

    canApproveContent(): boolean {
        return this.hasPermission(Permission.APPROVE_CONTENT);
    }

    isContentOwner(ownerId: string): boolean {
        return this.userId === ownerId;
    }
}