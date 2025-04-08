import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dataset, DatasetTag } from './dataset.entity';
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';
import { User } from '../users/user.entity';
import { plainToInstance } from 'class-transformer';
import mqtt from 'mqtt';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class DatasetsService {
    private connectionPool: mqtt.MqttClient[] = []; // Connection pool
    private maxConnections = 10; // Maximum concurrent connections


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
        this.verifyMqttConnection(createDatasetInstance.mqttAddress,
            createDatasetInstance.mqttPort,
            createDatasetInstance.mqttTopic,
            createDatasetInstance.mqttUsername,
            createDatasetInstance.mqttPassword);

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
        const editDatasetInstance = plainToInstance(UpdateDatasetDto, updateDto);

        editDatasetInstance.validateTags();
        editDatasetInstance.validateMqttData();
        this.verifyMqttConnection(updateDto.mqttAddress,
            editDatasetInstance.mqttPort,
            editDatasetInstance.mqttTopic,
            editDatasetInstance.mqttUsername,
            editDatasetInstance.mqttPassword);

        await this.datasetRepository.update(id, editDatasetInstance);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.datasetRepository.delete(id);
    }

    async verifyMqttConnection(mqttAddress: string, mqttPort: number, mqttTopic: string, mqttUsername?: string, mqttPassword?: string): Promise<void> {
        const options: mqtt.IClientOptions = {
            username: mqttUsername,
            password: mqttPassword,
        };

        if (this.connectionPool.length >= this.maxConnections) {
            throw new HttpException(`Limit exceeded during MQTT validation: Server does not allow more than ${this.maxConnections} MQTT connections`, HttpStatus.TOO_MANY_REQUESTS);
        }

        const client = mqtt.connect(`mqtt://${mqttAddress}:${mqttPort}`, options);

        return new Promise<void>((resolve, reject) => {
            client.on('connect', () => {
                client.end(); // Close the connection immediately
                console.log(`Connected to MQTT broker at ${mqttAddress}:${mqttPort}`);
                resolve();
            });

            client.on('error', (error) => {
                client.end(); // close the connection on error.
                console.error('MQTT connection error:', error);
                reject(new HttpException(error.message, HttpStatus.BAD_GATEWAY));
            });

            // Add a timeout to prevent hanging if the connection never succeeds
            setTimeout(() => {
                if (!client.connected) {
                    client.end(); // close the connection on timeout.
                    console.error('MQTT connection timeout');
                    reject(new HttpException('MQTT connection timeout', HttpStatus.REQUEST_TIMEOUT));
                }
            }, 5000); // 5 seconds timeout (adjust as needed)
        });
    }
}
