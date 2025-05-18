//See the PermissionMatrix.md in the docs folder for more info

export enum Permission {
    VIEW_PUBLIC_CONTENT = 'view_public_content',
    VIEW_CONTROLLED_DATASET_DETAILS = 'view_controlled_dataset_details',
    VIEW_OWN_UNAPPROVED_CONTENT = 'view_own_unapproved_content',
    VIEW_ALL_UNAPPROVED_CONTENT = 'view_all_unapproved_content',

    EDIT_OWN_CONTENT = 'edit_own_content',
    EDIT_ALL_CONTENT = 'edit_all_content',
    EDIT_HOMEPAGE_SETTINGS = 'edit_homepage_settings',

    CREATE_UNAPPROVED_CONTENT = 'create_unapproved_content',
    CREATE_APPROVED_CONTENT = 'create_approved_content',

    APPROVE_CONTENT = 'approve_content',
    MANAGE_USERS = 'manage_users'
}