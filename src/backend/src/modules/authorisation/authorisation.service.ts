import { Injectable } from '@nestjs/common';
import { Dataset, DatasetTag } from 'src/modules/datasets/dataset.entity';
import { Permission } from './enums/permissions.enum';
import { UserContext } from './user-context';

@Injectable()
export class AuthorisationService {
    canViewDataset(dataset: Dataset, userContext?: UserContext): boolean {
        if (!userContext) {
            // Public visitor can only see approved non-controlled datasets
            return dataset.isApproved && !dataset.isControlled;
        }

        return userContext.canViewDataset({
            id: dataset.id.toString(),
            isControlled: dataset.isControlled,
            ownerId: dataset.user.id,
            isApproved: dataset.isApproved,
        });
    }

    canEditDataset(dataset: Dataset, userContext: UserContext): boolean {
        return userContext.canEditDataset({
            ownerId: dataset.user.id,
            isControlled: dataset.isControlled,
        });
    }

    canViewTag(tag: DatasetTag, userContext?: UserContext): boolean {
        // If no user context, only show approved tags
        if (!userContext) {
            return tag.approvedAt !== null;
        }

        // Admins can see all tags
        if (userContext.hasPermission(Permission.VIEW_ALL_UNAPPROVED_CONTENT)) {
            return true;
        }

        // For now, users can only see approved tags unless they're admins
        // Logic for owned tags would require tag ownership in the entity model
        return tag.approvedAt !== null;
    }

    canApproveContent(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.APPROVE_CONTENT);
    }

    canManageUsers(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.MANAGE_USERS);
    }

    canEditHomepageSettings(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.EDIT_HOMEPAGE_SETTINGS);
    }

    canCreateApprovedContent(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.CREATE_APPROVED_CONTENT);
    }

    canViewAllUnapprovedContent(userContext?: UserContext): boolean {
        if (!userContext) return false;
        return userContext.hasPermission(Permission.VIEW_ALL_UNAPPROVED_CONTENT);
    }
}