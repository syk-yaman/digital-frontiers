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

    create(createTagDto: CreateDatasetTagDto): Promise<DatasetTag> {
        const tag = this.tagRepository.create(createTagDto);
        return this.tagRepository.save(tag);
    }

    async update(id: number, updateTagDto: UpdateDatasetTagDto): Promise<DatasetTag> {
        await this.tagRepository.update(id, updateTagDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.tagRepository.delete(id);
    }

    search(name: string): Promise<DatasetTag[]> {
        return this.tagRepository.find({ where: { name: Like(`%${name}%`) } });
    }
}
