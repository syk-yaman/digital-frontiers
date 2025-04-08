import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dataset, DatasetTag } from './dataset.entity';
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';
import { User } from '../users/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DatasetsService {
    constructor(
        @InjectRepository(Dataset)
        private datasetRepository: Repository<Dataset>,
        @InjectRepository(DatasetTag)
        private tagRepository: Repository<DatasetTag>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    findAll(): Promise<Dataset[]> {
        return this.datasetRepository.find({ relations: ['links', 'locations', 'sliderImages', 'tags'] });
    }

    findOne(id: number): Promise<Dataset | null> {
        return this.datasetRepository.findOne({
            where: { id },
            relations: ['links', 'locations', 'sliderImages', 'tags'],
        });
    }

    findRecent(): Promise<Dataset[]> {
        return this.datasetRepository.find({
            order: { createdAt: 'DESC' },
            take: 3,
            relations: ['links', 'locations', 'sliderImages', 'tags'],
        });
    }

    async create(createDto: CreateDatasetDto): Promise<Dataset> {
        // Transform plain object into an instance of CreateDatasetDto
        const createDatasetInstance = plainToInstance(CreateDatasetDto, createDto);

        // Validation
        createDatasetInstance.validateTags();
        createDatasetInstance.validateMqttData();

        // Handle tags & prevent duplicates
        const tags = await Promise.all(
            createDatasetInstance.tags.map(async (tagDto) => {
                if (tagDto.id) {
                    // Check if the tag exists
                    const existingTag = await this.tagRepository.findOne({ where: { id: tagDto.id } });
                    if (existingTag) {
                        return existingTag; // Reuse existing tag
                    }
                }
                // Generate a random color if not provided
                tagDto.colour = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
                tagDto.icon = '🏷️';
                const newTag = this.tagRepository.create(tagDto);
                return this.tagRepository.save(newTag);
            }),
        );

        const user = await this.usersRepository.findOne({ where: { id: createDatasetInstance.userId } });
        if (!user) {
            throw new Error('User not found');
        }

        console.log(createDatasetInstance);
        const newDataset = this.datasetRepository.create({ ...createDatasetInstance, tags, user });
        return this.datasetRepository.save(newDataset);
    }

    async update(id: number, updateDto: UpdateDatasetDto): Promise<Dataset> {
        updateDto.validateTags();
        updateDto.validateMqttData();

        await this.datasetRepository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.datasetRepository.delete(id);
    }
}
