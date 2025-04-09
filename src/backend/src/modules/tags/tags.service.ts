import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DatasetTag } from '../datasets/dataset.entity';
import { CreateDatasetTagDto } from './tags.dto';
import { UpdateDatasetTagDto } from './tags.dto';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(DatasetTag)
        private readonly tagRepository: Repository<DatasetTag>,
    ) { }

    findAll(): Promise<DatasetTag[]> {
        return this.tagRepository.find();
    }

    findOne(id: number): Promise<DatasetTag | null> {
        return this.tagRepository.findOne({ where: { id } });
    }

    async create(createDto: CreateDatasetTagDto): Promise<DatasetTag> {
        createDto.validateOrderInNavbar();

        const newTag = this.tagRepository.create(createDto);
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
        return this.tagRepository.find({ where: { name: Like(`%${name}%`) } });
    }
}
