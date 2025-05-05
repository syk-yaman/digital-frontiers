import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum DatasetType {
    OPEN = 'open',
    CONTROLLED = 'controlled',
}

export enum UpdateFrequencyUnit {
    ONLY_ONCE = 'once',
    SECONDS = 'seconds',
    MINUTES = 'minutes',
    HOURS = 'hours',
    DAYS = 'days',
    WEEKS = 'weeks',
    MONTHS = 'months',
    YEARS = 'years',
}

@Entity('datasets')
export class Dataset {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.datasets, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    name!: string;

    @Column()
    dataOwnerName!: string;

    @Column()
    dataOwnerEmail!: string;

    @Column({ type: 'enum', enum: DatasetType })
    datasetType!: DatasetType;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'float' })
    updateFrequency!: number;

    @Column({ type: 'enum', enum: UpdateFrequencyUnit })
    updateFrequencyUnit!: UpdateFrequencyUnit;

    @Column({ type: 'text', nullable: true })
    dataExample?: string;

    @OneToMany(() => DatasetLink, (link) => link.dataset, { cascade: true })
    links?: DatasetLink[];

    @OneToMany(() => DatasetLocation, (location) => location.dataset, { cascade: true })
    locations?: DatasetLocation[];

    @OneToMany(() => DatasetSliderImage, (image) => image.dataset, { cascade: true })
    sliderImages!: DatasetSliderImage[];

    @ManyToMany(() => DatasetTag, { cascade: true })
    @JoinTable()
    tags!: DatasetTag[];

    @Column({ nullable: true })
    mqttAddress?: string;

    @Column({ nullable: true })
    mqttPort?: number;

    @Column({ nullable: true })
    mqttTopic?: string;

    @Column({ nullable: true })
    mqttUsername?: string;

    @Column({ nullable: true })
    mqttPassword?: string;

    @Column({ type: 'timestamp', nullable: true })
    approvedAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    deniedAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;  // Soft delete column

    // Helper method for domain logic
    get isControlled(): boolean {
        return this.datasetType === DatasetType.CONTROLLED;
    }

    get isApproved(): boolean {
        return this.approvedAt !== null;
    }

    isOwnedBy(userId: string): boolean {
        return this.user.id === userId;
    }
}

@Entity('dataset_links')
export class DatasetLink {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Dataset, (dataset) => dataset.links, { onDelete: 'CASCADE' })
    dataset!: Dataset;

    @Column()
    title!: string;

    @Column()
    url!: string;
}

@Entity('dataset_locations')
export class DatasetLocation {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Dataset, (dataset) => dataset.locations, { onDelete: 'CASCADE' })
    dataset!: Dataset;

    @Column({ type: 'float' })
    lon!: number;

    @Column({ type: 'float' })
    lat!: number;
}

@Entity('dataset_slider_images')
export class DatasetSliderImage {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Dataset, (dataset) => dataset.sliderImages, { onDelete: 'CASCADE' })
    dataset!: Dataset;

    @Column()
    fileName!: string;
}

@Entity('dataset_tags')
export class DatasetTag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    colour!: string;

    @Column()
    icon!: string;

    @Column({ type: 'int', nullable: true })
    orderInNavbar?: number;

    @Column({ type: 'timestamp', nullable: true })
    approvedAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;  // Soft delete column
}