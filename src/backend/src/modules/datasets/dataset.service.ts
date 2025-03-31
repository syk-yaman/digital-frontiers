import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dataset, DatasetTag } from './dataset.entity'; // Import DatasetTag
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';

@Injectable()
export class DatasetsService {
    constructor(
        @InjectRepository(Dataset)
        private datasetRepository: Repository<Dataset>,
        @InjectRepository(DatasetTag)
        private tagRepository: Repository<DatasetTag>, // Inject the tag repository
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
        // Handle tags
        const tags = await Promise.all(
            createDto.tags.map(async (tagDto) => {
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

        // Create the dataset with the processed tags
        const newDataset = this.datasetRepository.create({ ...createDto, tags });
        return this.datasetRepository.save(newDataset);
    }

    async update(id: number, updateDto: UpdateDatasetDto): Promise<Dataset> {
        await this.datasetRepository.update(id, updateDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.datasetRepository.delete(id);
    }
}
