import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not, In } from 'typeorm';
import { DatasetTag } from '../datasets/dataset.entity';
import { CreateDatasetTagDto, UpdateDatasetTagDto } from './tags.dto';
import { AuthorisationService } from '../authorisation/authorisation.service';
import { Permission } from '../authorisation/enums/permissions.enum';
import { UserContext } from '../authorisation/user-context';

@Injectable()
export class TagsService {

    constructor(
        @InjectRepository(DatasetTag)
        private readonly tagRepository: Repository<DatasetTag>,
        private authorisationService: AuthorisationService,
    ) { }

    findAll(): Promise<DatasetTag[]> {
        //Only return approved tags
        return this.tagRepository.find({
            where: {
                approvedAt: Not(IsNull())
            },
            order: { createdAt: 'DESC' }
        });
    }

    async findPendingApproval(userContext: UserContext): Promise<DatasetTag[]> {
        // Only admins can see all pending approval tags
        if (!this.authorisationService.canViewAllUnapprovedContent(userContext)) {
            throw new HttpException('Not authorised', HttpStatus.FORBIDDEN);
        }

        return this.tagRepository.find({
            where: {
                approvedAt: IsNull()
            },
            order: { createdAt: 'DESC' }
        });
    }

    findOne(id: number, userContext?: UserContext): Promise<DatasetTag | null> {
        // Only admins can see unapproved tags by ID lookup
        if (userContext && this.authorisationService.canViewAllUnapprovedContent(userContext)) {
            return this.tagRepository.findOne({
                where: { id }
            });
        }

        // Otherwise only return approved tags
        return this.tagRepository.findOne({
            where: {
                id,
                approvedAt: Not(IsNull())
            }
        }).then(tag => {
            if (!tag) {
                throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
            }
            return tag;
        });
    }

    async create(createDto: CreateDatasetTagDto, userContext: UserContext): Promise<DatasetTag> {
        createDto.validateOrderInNavbar();

        const newTag = this.tagRepository.create(createDto);

        // Auto-approve tag if user has permission
        if (userContext.hasPermission(Permission.CREATE_APPROVED_CONTENT)) {
            newTag.approvedAt = new Date();
        }

        return this.tagRepository.save(newTag);
    }

    async update(id: number, updateDto: UpdateDatasetTagDto): Promise<DatasetTag> {
        updateDto.validateOrderInNavbar();

        await this.tagRepository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<{ message: string; affectedDatasets?: number }> {
        // First, check if the tag exists
        const tag = await this.tagRepository.findOne({
            where: { id }
        });

        if (!tag) {
            throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
        }

        // Count datasets using this tag by querying the junction table
        const affectedDatasetsCount = await this.tagRepository.manager.query(
            `SELECT COUNT(*) as count FROM datasets_tags_dataset_tags WHERE "datasetTagsId" = $1`,
            [id]
        ).then(result => Number(result[0]?.count || 0));

        try {
            // Delete the tag - the database will handle cascade removal of the tag-dataset relationships
            await this.tagRepository.delete(id);

            // Prepare appropriate response message based on affected datasets
            let message = `Tag "${tag.name}" has been deleted successfully.`;

            if (affectedDatasetsCount > 0) {
                message += ` The tag has been automatically removed from ${affectedDatasetsCount} dataset(s).`;
                return {
                    message,
                    affectedDatasets: affectedDatasetsCount
                };
            }

            return { message };

        } catch (error) {
            console.error('Error deleting tag:', error);
            throw new HttpException(
                'Failed to delete tag. There was an error in the database operation.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    search(name: string): Promise<DatasetTag[]> {
        return this.tagRepository.find({
            where: {
                approvedAt: Not(IsNull()),
                name: Like(`%${name}%`)
            }
        });
    }

    async getNavbarTags(): Promise<DatasetTag[]> {
        return this.tagRepository.find({
            where: {
                approvedAt: Not(IsNull()), // Only return approved tags
                orderInNavbar: Not(IsNull()) // Only return tags that are in the navbar
            },
            order: { orderInNavbar: 'ASC' }, // Order by creation date in descending order
            take: 5, // Limit to the last 5 created tags
        });
    }

    async approveTag(id: number, userContext: UserContext): Promise<DatasetTag> {
        // Check authorization
        if (!this.authorisationService.canApproveContent(userContext)) {
            throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);
        }

        const tag = await this.tagRepository.findOne({
            where: { id }
        });

        if (!tag) {
            throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
        }

        tag.approvedAt = new Date();
        return this.tagRepository.save(tag);
    }

    async approveTagsForDataset(tags: DatasetTag[], userContext: UserContext): Promise<void> {
        if (!this.authorisationService.canApproveContent(userContext)) {
            return;
        }

        if (!tags || tags.length === 0) return;

        const now = new Date();
        for (const tag of tags) {
            if (!tag.approvedAt) {
                tag.approvedAt = now;
                await this.tagRepository.save(tag);
            }
        }
    }

    async approveTags(tagIds: number[], userContext: UserContext): Promise<void> {
        if (!this.authorisationService.canApproveContent(userContext) || !tagIds || tagIds.length === 0) {
            return;
        }

        const now = new Date();
        await this.tagRepository.update(
            { id: In(tagIds), approvedAt: IsNull() },
            { approvedAt: now }
        );
    }


}