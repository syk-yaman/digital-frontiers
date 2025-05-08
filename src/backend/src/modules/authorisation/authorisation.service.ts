import { Injectable } from '@nestjs/common';
import { Dataset, DatasetTag } from 'src/modules/datasets/dataset.entity';
import { Permission } from './enums/permissions.enum';
import { UserContext } from './user-context';

/**
 * AuthorisationService
 * 
 * Central service responsible for handling authorisation decisions across the application.
 * Uses the UserContext to evaluate permissions against different resources and actions.
 * Provides methods to check if users can view, edit, and approve different types of content.
 */
@Injectable()
export class AuthorisationService {

    /**
      * Determines if a user can view a specific dataset
      * 
      * @param dataset - The dataset to be viewed
      * @param userContext - The user's security context (optional, for public access checks)
      * @returns True if the user can view the dataset, false otherwise
      */
    canViewDataset(dataset: Dataset, userContext: UserContext): boolean {

        // Public visitor can only see approved non-controlled datasets
        if (userContext.userId === null) {
            return dataset.isApproved && !dataset.isControlled;
        }

        // Admins can view any dataset
        if (userContext.hasPermission(Permission.VIEW_ALL_UNAPPROVED_CONTENT)) {
            return true;
        }

        // If user is the owner, they can view their dataset regardless of approval status
        if (userContext.userId === dataset.user.id) {
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
        //return this.controlledDatasetIds.includes(dataset.id);

        return false;
    }

    canDeleteDataset(dataset: Dataset, userContext: UserContext): boolean {
        // Admin can delete anything
        if (userContext.hasPermission(Permission.EDIT_ALL_CONTENT)) {
            return true;
        }

        // Users can delete their own content
        if (userContext.userId === dataset.user.id) {
            return true;
        }

        // Content owners with controlled dataset permission can delete controlled datasets
        if (dataset.isControlled &&
            userContext.hasPermission(Permission.EDIT_CONTROLLED_DATASETS)) {
            return true;
        }

        return false;
    }

    /**
        * Determines if a user can edit a specific dataset
        * 
        * @param dataset - The dataset to be edited
        * @param userContext - The user's security context
        * @returns True if the user can edit the dataset, false otherwise
        */
    canEditDataset(dataset: Dataset, userContext: UserContext): boolean {
        // Admin can edit anything
        if (userContext.hasPermission(Permission.EDIT_ALL_CONTENT)) {
            return true;
        }

        // Users can edit their own content
        if (userContext.userId === dataset.user.id) {
            return true;
        }

        // Content owners with controlled dataset permission can edit controlled datasets
        if (dataset.isControlled &&
            userContext.hasPermission(Permission.EDIT_CONTROLLED_DATASETS)) {
            return true;
        }

        return false;
    }

    /**
    * Checks if a user has permission to approve content
    * 
    * @param userContext - The user's security context
    * @returns True if the user can approve content, false otherwise
    */
    canApproveContent(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.APPROVE_CONTENT);
    }

    /**
     * Checks if the user is the owner of specific content.
     * 
     * @param dataset - The dataset to check ownership
     * @param userContext - The user's security context
     * @returns True if the user is the content owner, false otherwise
     */
    isContentOwner(dataset: Dataset, userContext: UserContext): boolean {
        return userContext.userId === dataset.user.id;
    }

    /**
     * Determines if a user can view a specific tag
     * 
     * @param tag - The tag to be viewed
     * @param userContext - The user's security context (optional, for public access checks)
     * @returns True if the user can view the tag, false otherwise
     */
    canViewTag(tag: DatasetTag, userContext: UserContext): boolean {
        // If no user context, only show approved tags
        //if (!userContext) {
        //   return tag.approvedAt !== null;
        //}

        // Admins can see all tags
        if (userContext.hasPermission(Permission.VIEW_ALL_UNAPPROVED_CONTENT)) {
            return true;
        }

        // For now, users can only see approved tags unless they're admins
        // Logic for owned tags would require tag ownership in the entity model
        return tag.approvedAt !== null;
    }


    /**
     * Checks if a user has permission to manage other users
     * 
     * @param userContext - The user's security context
     * @returns True if the user can manage other users, false otherwise
     */
    canManageUsers(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.MANAGE_USERS);
    }

    /**
     * Checks if a user has permission to edit homepage settings
     * 
     * @param userContext - The user's security context
     * @returns True if the user can edit homepage settings, false otherwise
     */
    canEditHomepageSettings(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.EDIT_HOMEPAGE_SETTINGS);
    }

    /**
     * Checks if a user has permission to create pre-approved content
     * 
     * @param userContext - The user's security context
     * @returns True if the user can create pre-approved content, false otherwise
     */
    canCreateApprovedContent(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.CREATE_APPROVED_CONTENT);
    }

    /**
     * Checks if a user has permission to view all unapproved content
     * 
     * @param userContext - The user's security context (optional)
     * @returns True if the user can view all unapproved content, false otherwise
     */
    canViewAllUnapprovedContent(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.VIEW_ALL_UNAPPROVED_CONTENT);
    }
}