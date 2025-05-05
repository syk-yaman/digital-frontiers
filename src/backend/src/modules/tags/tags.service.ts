import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not, In } from 'typeorm';
import { DatasetTag } from '../datasets/dataset.entity';
import { CreateDatasetTagDto, UpdateDatasetTagDto } from './tags.dto';
import { AuthorisationService } from '../authorisation/authorisation.service-Yaman’s MacBook Pro';
import { Permission } from '../authorisation/enums/permissions.enum';
import { UserContext } from '../authorisation/user-context';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(DatasetTag)
        private readonly tagRepository: Repository<DatasetTag>,
        private authorisationService: AuthorisationService,
    ) { }

    findAll(userContext?: UserContext): Promise<DatasetTag[]> {
        // Only admins can see all unapproved tags
        if (userContext && this.authorisationService.canViewAllUnapprovedContent(userContext)) {
            return this.tagRepository.find({
                order: { createdAt: 'DESC' }
            });
        }

        // Otherwise, only return approved tags
        return this.tagRepository.find({
            where: {
                approvedAt: Not(IsNull())
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
        if (this.shouldAutoApproveTags(userContext)) {
            newTag.approvedAt = new Date();
        }

        return this.tagRepository.save(newTag);
    }

    async update(id: number, updateDto: UpdateDatasetTagDto): Promise<DatasetTag> {
        updateDto.validateOrderInNavbar();

        await this.tagRepository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.tagRepository.delete(id);
    }

    search(name: string): Promise<DatasetTag[]> {
        return this.tagRepository.find({
            where: {
                approvedAt: Not(IsNull()),
                name: Like(`%${name}%`)
            }
        });
    }

    async getTopTags(): Promise<DatasetTag[]> {
        return this.tagRepository.find({
            where: {
                approvedAt: Not(IsNull()) // Only return approved tags
            },
            order: { createdAt: 'DESC' }, // Order by creation date in descending order
            take: 5, // Limit to the last 5 created tags
        });
    }

    async approveTagsForDataset(tags: DatasetTag[], userContext: UserContext): Promise<void> {
        if (!userContext.canApproveContent()) {
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
        if (!userContext.canApproveContent() || !tagIds || tagIds.length === 0) {
            return;
        }

        const now = new Date();
        await this.tagRepository.update(
            { id: In(tagIds), approvedAt: IsNull() },
            { approvedAt: now }
        );
    }

    shouldAutoApproveTags(userContext: UserContext): boolean {
        return userContext.hasPermission(Permission.CREATE_APPROVED_CONTENT);
    }
}
