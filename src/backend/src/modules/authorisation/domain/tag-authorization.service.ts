import { Injectable } from '@nestjs/common';
import { DatasetTag } from '../../datasets/dataset.entity';
import { UserContext } from '../user-context';
import { Permission } from '../enums/permissions.enum';

@Injectable()
export class TagAuthorizationService {
  canUserViewTag(tag: DatasetTag, userContext?: UserContext): boolean {
    // If no user context, only show approved tags
    if (!userContext) {
      return tag.approvedAt !== null;
    }
    
    // Admins can see all tags
    if (userContext.hasPermission(Permission.VIEW_ALL_UNAPPROVED_CONTENT)) {
      return true;
    }
    
    // Regular users can only see approved tags
    return tag.approvedAt !== null;
  }
  
  shouldAutoApproveTag(userContext: UserContext): boolean {
    return userContext.hasPermission(Permission.CREATE_APPROVED_CONTENT);
  }
}