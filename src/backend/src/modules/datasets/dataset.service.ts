import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Dataset, DatasetLink, DatasetLocation, DatasetSliderImage, DatasetTag } from './dataset.entity';
import { CreateDatasetDto, UpdateDatasetDto } from './dataset.dto';
import { User } from '../users/user.entity';
import { plainToInstance } from 'class-transformer';
import mqtt from 'mqtt';
import { TagsService } from '../tags/tags.service';
import { AuthorisationService } from '../authorisation/authorisation.service-Yaman’s MacBook Pro';
import { Permission } from '../authorisation/enums/permissions.enum';
import { UserContext } from '../authorisation/user-context';

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
        private authorisationService: AuthorisationService,
        private tagsService: TagsService,
    ) { }

    async findAll(userContext?: UserContext): Promise<Dataset[]> {
        const datasets = await this.datasetRepository.find({
            relations: ['links', 'locations', 'sliderImages', 'tags', 'user'],
            order: { createdAt: 'DESC' },
        });

        // Filter datasets based on permissions
        return datasets.filter(dataset =>
            this.authorisationService.canViewDataset(dataset, userContext)
        );
    }

    findAllApproved(): Promise<Dataset[]> {
        return this.datasetRepository.find({
            where: { approvedAt: Not(IsNull()) }, // Only fetch datasets with approvedAt not null
            relations: ['links', 'locations', 'sliderImages', 'tags'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number, userContext?: UserContext): Promise<Dataset | null> {
        const dataset = await this.datasetRepository.findOne({
            where: { id },
            relations: ['links', 'locations', 'sliderImages', 'tags', 'user'],
        });

        if (!dataset) {
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        }

        // Check if user can view this dataset
        if (!this.authorisationService.canViewDataset(dataset, userContext)) {
            throw new HttpException('Dataset not found or not approved yet', HttpStatus.NOT_FOUND);
        }

        return dataset;
    }

    findRecent(): Promise<Dataset[]> {
        return this.datasetRepository.find({
            where: { approvedAt: Not(IsNull()) },
            order: { createdAt: 'DESC' },
            take: 3,
            relations: ['links', 'locations', 'sliderImages', 'tags'],
        });
    }

    // Update the findByUser method to be more explicit about ownership
    findByUser(userId: string): Promise<Dataset[]> {
        return this.datasetRepository.find({
            where: { user: { id: userId } },
            relations: ['links', 'locations', 'sliderImages', 'tags'],
            order: { createdAt: 'DESC' },
        });
    }

    async findPendingApproval(userContext: UserContext): Promise<Dataset[]> {
        // Only admins can see all pending datasets
        if (!this.authorisationService.canViewAllUnapprovedContent(userContext)) {
            throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);
        }

        return this.datasetRepository.find({
            where: {
                approvedAt: IsNull(),
                deniedAt: IsNull()
            },
            relations: ['links', 'locations', 'sliderImages', 'tags', 'user'],
            order: { createdAt: 'DESC' },
        });
    }

    async approveDataset(id: number, userContext: UserContext): Promise<Dataset> {
        if (!userContext.canApproveContent()) {
            throw new HttpException('Not authorized', HttpStatus.FORBIDDEN);
        }

        const dataset = await this.datasetRepository.findOne({
            where: { id },
            relations: ['tags']
        });

        if (!dataset) {
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        }

        dataset.approvedAt = new Date();

        // Approve all unapproved tags when dataset is approved
        if (dataset.tags && dataset.tags.length > 0) {
            const now = new Date();
            for (const tag of dataset.tags) {
                if (!tag.approvedAt) {
                    tag.approvedAt = now;
                    await this.tagRepository.save(tag);
                }
            }
        }

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

    async create(createDto: CreateDatasetDto, userContext: UserContext): Promise<Dataset> {
        // Transform plain object into an instance of CreateDatasetDto
        const createDatasetInstance = plainToInstance(CreateDatasetDto, createDto);

        const user = await this.usersRepository.findOne({ where: { id: createDatasetInstance.userId } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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
                tagDto.colour = tagDto.colour || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
                tagDto.icon = tagDto.icon || '🏷️';
                const newTag = this.tagRepository.create(tagDto);

                // Auto-approve tag if user has permission to create approved content
                if (this.tagsService.shouldAutoApproveTags(userContext)) {
                    newTag.approvedAt = new Date();
                }

                return this.tagRepository.save(newTag);
            }),
        );

        const newDataset = this.datasetRepository.create({ ...createDatasetInstance, tags, user });

        // Auto-approve dataset if user can create approved content
        if (userContext.hasPermission(Permission.CREATE_APPROVED_CONTENT)) {
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
