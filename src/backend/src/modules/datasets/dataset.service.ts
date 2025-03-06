import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dataset } from './dataset.entity';
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';

@Injectable()
export class DatasetsService {
    constructor(
        @InjectRepository(Dataset)
        private datasetRepository: Repository<Dataset>,
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
        const newDataset = this.datasetRepository.create(createDto);
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
