import { Injectable } from '@nestjs/common';
import { Dataset } from '../../datasets/dataset.entity';
import { UserContext } from '../user-context';

@Injectable()
export class DatasetAuthorizationService {
  canUserViewDataset(dataset: Dataset, userContext?: UserContext): boolean {
    if (!userContext) {
      // Public visitor can only see approved non-controlled datasets
      return dataset.approvedAt !== null && dataset.datasetType === 'open';
    }
    
    // If user is the owner, they can view their dataset regardless of approval status
    if (userContext.userId === dataset.user.id) {
      return true;
    }
    
    // Admins can view any dataset
    if (userContext.hasRole('admin')) {
      return true;
    }
    
    // For non-owners, the dataset must be approved
    if (!dataset.approvedAt) {
      return false;
    }
    
    // For public datasets that are approved, anyone can view
    if (dataset.datasetType === 'open') {
      return true;
    }
    
    // For controlled datasets that are approved, only users with specific access can view
    if (userContext.controlledDatasetIds && 
        userContext.controlledDatasetIds.includes(dataset.id.toString())) {
      return true;
    }
    
    return false;
  }
}