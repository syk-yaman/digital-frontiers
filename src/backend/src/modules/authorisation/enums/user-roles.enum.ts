//See the PermissionMatrix.md in the docs folder for more info

export enum UserRole {
    PUBLIC_VISITOR = 'public',
    GENERAL_USER = 'user',
    CONTROLLED_DATASET_GRANTED_USER = 'controlled_dataset_granted_user',
    CONTENT_OWNER = 'content_owner',
    ADMIN = 'admin'
}