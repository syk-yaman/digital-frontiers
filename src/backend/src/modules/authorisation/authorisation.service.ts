import { Injectable, Logger } from '@nestjs/common';
import { Dataset, DatasetTag, DatasetType } from 'src/modules/datasets/dataset.entity';
import { Permission } from './enums/permissions.enum';
import { UserContext } from './user-context';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './enums/user-roles.enum';



/**
 * AuthorisationService
 * 
 * Central service responsible for handling authorisation decisions across the application.
 * Uses the UserContext to evaluate permissions against different resources and actions.
 * Provides methods to check if users can view, edit, and approve different types of content.
 */
@Injectable()
export class AuthorisationService {

    constructor(
        @InjectRepository(Dataset)
        private datasetRepository: Repository<Dataset>,
    ) { }

    /**
      * Determines if a user can view a specific dataset
      * 
      * @param dataset - The dataset to be viewed
      * @param userContext - The user's security context (optional, for public access checks)
      * @returns True if the user can view the dataset, false otherwise
      */
    async canViewDataset(datasetId: number, userContext: UserContext): Promise<boolean> {

        Logger.log('Checking dataset view permissions for user:', userContext.userId);
        const dataset = await this.datasetRepository.findOne({
            where: { id: datasetId },
            relations: ['user']
        });

        // Anyone can see approved datasets
        if (dataset.isApproved) {
            return true;
        }

        // Admins can view any dataset
        if (userContext.hasRole(UserRole.ADMIN)) {
            return true;
        }

        // If user is the owner, they can view their dataset regardless of approval status
        if (userContext.userId === dataset.user.id) {
            return true;
        }

        return false;
    }

    /**
     * Determines if a user can view the links and MQTT details 
     * of a controlled or public dataset
     * 
     * @param dataset - The dataset to be viewed
     * @param userContext - The user's security context
     * @returns True if the user can view the dataset details, false otherwise
     */
    async canViewDatasetDetails(datasetId: number, userContext: UserContext): Promise<boolean> {
        const dataset = await this.datasetRepository.findOne({
            where: { id: datasetId },
            relations: ['user']
        });

        //Dataset not found
        if (!dataset) {
            return false;
        }

        if (dataset.datasetType == DatasetType.OPEN) {
            return true;
        } else if (dataset.datasetType == DatasetType.CONTROLLED) {
            // Public visitor can only see approved non-controlled datasets
            if (userContext.userId === null) {
                return false;
            }

            // Admins can view all controlled datasets details
            if (userContext.hasRole(UserRole.ADMIN)) {
                return true;
            }

            // Content owner can view their own dataset details even if it's controlled
            if (userContext.userId === dataset.user.id) {
                return true;
            }

            // Controlled dataset granted user (has access to this dataset)
            if (
                dataset.isControlled &&
                userContext.controlledDatasetIds &&
                userContext.controlledDatasetIds.includes(dataset.id)
            ) {
                return true;
            }

        }

        // Otherwise, not allowed
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