import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Dataset, DatasetLink, DatasetLocation, DatasetSliderImage, DatasetTag } from './dataset.entity';
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
        return this.datasetRepository.find({
            relations: ['links', 'locations', 'sliderImages', 'tags'],
            order: { createdAt: 'DESC' },
        });
    }

    findAllApproved(): Promise<Dataset[]> {
        return this.datasetRepository.find({
            where: { approvedAt: Not(IsNull()) }, // Only fetch datasets with approvedAt not null
            relations: ['links', 'locations', 'sliderImages', 'tags'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Dataset | null> {
        var dataset = await this.datasetRepository.findOne({
            where: { id },
            relations: ['links', 'locations', 'sliderImages', 'tags'],
        });

        if (!dataset) {
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        }

        return dataset;
        // if (dataset.approvedAt !== null) {
        //     return dataset;
        // } else {
        //     console.log(currentUserId);
        //     const currentUser = await this.usersRepository.findOne({ where: { id: currentUserId } });
        //     if (!currentUser) {
        //         throw new Error('User not found');
        //     }

        //     if (!currentUser.isAdmin) {
        //         throw new HttpException('Dataset not found.', HttpStatus.NOT_FOUND);
        //     } else {
        //         return dataset;
        //     }
        // }
    }

    findRecent(): Promise<Dataset[]> {
        return this.datasetRepository.find({
            where: { approvedAt: Not(IsNull()) },
            order: { createdAt: 'DESC' },
            take: 3,
            relations: ['links', 'locations', 'sliderImages', 'tags'],
        });
    }

    findByUser(userId: string): Promise<Dataset[]> {
        return this.datasetRepository.find({
            where: { user: { id: userId } },
            relations: ['links', 'locations', 'sliderImages', 'tags'],
        });
    }

    findPendingApproval(): Promise<Dataset[]> {
        return this.datasetRepository.find({
            where: {
                approvedAt: IsNull(),
                deniedAt: IsNull()
            },
            relations: ['links', 'locations', 'sliderImages', 'tags'],
            order: { createdAt: 'DESC' },
        });
    }

    async approveDataset(id: number): Promise<Dataset> {
        const dataset = await this.datasetRepository.findOne({ where: { id } });
        if (!dataset) {
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        }
        dataset.approvedAt = new Date();
        return this.datasetRepository.save(dataset);
    }

    async denyDataset(id: number) {
        const dataset = await this.datasetRepository.findOne({ where: { id } });
        if (!dataset) {
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        }
        dataset.deniedAt = new Date();
        return this.datasetRepository.save(dataset);
    }

    async create(createDto: CreateDatasetDto): Promise<Dataset> {
        // Transform plain object into an instance of CreateDatasetDto
        const createDatasetInstance = plainToInstance(CreateDatasetDto, createDto);

        const user = await this.usersRepository.findOne({ where: { id: createDatasetInstance.userId } });
        if (!user) {
            throw new Error('User not found');
        }

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

        console.log(createDatasetInstance);
        const newDataset = this.datasetRepository.create({ ...createDatasetInstance, tags, user });

        if (user.isAdmin) { //Auto approve if user is admin
            newDataset.approvedAt = new Date();
        }

        return this.datasetRepository.save(newDataset);
    }

    async update(id: number, updateDto: UpdateDatasetDto, currentUserId: string): Promise<Dataset> {
        const editDatasetInstance = plainToInstance(UpdateDatasetDto, updateDto);

        const currentUser = await this.usersRepository.findOne({ where: { id: currentUserId } });
        if (!currentUser) {
            throw new Error('User not found');
        }

        // Fetch the existing dataset with user and links
        const existingDataset = await this.datasetRepository.findOne({
            where: { id },
            relations: ['user', 'links', 'locations', 'sliderImages', 'tags'],
        });

        if (!existingDataset) {
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        }

        // Check if the current user is allowed to edit the dataset
        if (existingDataset.user.id !== currentUser.id && !currentUser.isAdmin) {
            throw new HttpException('You are not authorised to edit this dataset.', HttpStatus.FORBIDDEN);
        }

        // Validate tags and MQTT data
        editDatasetInstance.validateTags();
        editDatasetInstance.validateMqttData();
        this.verifyMqttConnection(
            editDatasetInstance.mqttAddress,
            editDatasetInstance.mqttPort,
            editDatasetInstance.mqttTopic,
            editDatasetInstance.mqttUsername,
            editDatasetInstance.mqttPassword,
        );

        // Update scalar fields
        Object.assign(existingDataset, {
            name: editDatasetInstance.name,
            dataOwnerName: editDatasetInstance.dataOwnerName,
            dataOwnerEmail: editDatasetInstance.dataOwnerEmail,
            datasetType: editDatasetInstance.datasetType,
            description: editDatasetInstance.description,
            updateFrequency: editDatasetInstance.updateFrequency,
            updateFrequencyUnit: editDatasetInstance.updateFrequencyUnit,
            dataExample: editDatasetInstance.dataExample,
            mqttAddress: editDatasetInstance.mqttAddress,
            mqttPort: editDatasetInstance.mqttPort,
            mqttTopic: editDatasetInstance.mqttTopic,
            mqttUsername: editDatasetInstance.mqttUsername,
            mqttPassword: editDatasetInstance.mqttPassword,
        });

        // Handle tags
        const tags = await Promise.all(
            editDatasetInstance.tags.map(async (tagDto) => {
                if (tagDto.id) {
                    const existingTag = await this.tagRepository.findOne({ where: { id: tagDto.id } });
                    if (existingTag) {
                        return existingTag;
                    }
                }
                tagDto.colour = tagDto.colour || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
                tagDto.icon = tagDto.icon || '🏷️';
                const newTag = this.tagRepository.create(tagDto);
                return this.tagRepository.save(newTag);
            }),
        );
        existingDataset.tags = tags;

        // Handle links: Delete old links and create new ones
        await this.datasetRepository.manager.delete(DatasetLink, { dataset: { id } });
        const links = [];
        for (const linkDto of editDatasetInstance.links) {
            const newLink = this.datasetRepository.manager.create(DatasetLink, { ...linkDto, dataset: existingDataset });
            const savedLink = await this.datasetRepository.manager.save(newLink); // Save sequentially to preserve order
            links.push(savedLink);
        }
        existingDataset.links = links;

        // Handle locations: Delete old locations and create new ones
        await this.datasetRepository.manager.delete(DatasetLocation, { dataset: { id } });
        const locations = [];
        for (const locationDto of editDatasetInstance.locations) {
            const newLocation = this.datasetRepository.manager.create(DatasetLocation, { ...locationDto, dataset: existingDataset });
            const savedLocation = await this.datasetRepository.manager.save(newLocation); // Save sequentially to preserve order
            locations.push(savedLocation);
        }
        existingDataset.locations = locations;

        // Handle slider images: Delete old slider images and create new ones
        await this.datasetRepository.manager.delete(DatasetSliderImage, { dataset: { id } });
        const sliderImages = [];
        for (const imageDto of editDatasetInstance.sliderImages) {
            const newImage = this.datasetRepository.manager.create(DatasetSliderImage, { ...imageDto, dataset: existingDataset });
            const savedImage = await this.datasetRepository.manager.save(newImage); // Save sequentially to preserve order
            sliderImages.push(savedImage);
        }
        existingDataset.sliderImages = sliderImages;
        existingDataset.approvedAt = null; // Needs admin approval again

        // Save the updated dataset
        await this.datasetRepository.save(existingDataset);

        // Fetch only the required fields and relations after saving
        return this.datasetRepository.findOne({
            where: { id },
            relations: ['links', 'locations', 'sliderImages', 'tags'], // Include only necessary relations
        });
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

    async findByTagId(tagId: number): Promise<Dataset[]> {
        return this.datasetRepository.find({
            where: {
                tags: { id: tagId },
                approvedAt: Not(IsNull()) // Only return approved datasets
            },
            relations: ['links', 'locations', 'sliderImages', 'tags'],
            order: { createdAt: 'DESC' },
        });
    }
}
