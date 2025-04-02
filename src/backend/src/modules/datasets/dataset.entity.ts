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

    @ManyToOne(() => User, (user) => user.datasets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' }) // Link the userId column
    user!: User;

    @Column()
    name!: string;

    @Column()
    dataOwnerName!: string;

    @Column()
    dataOwnerEmail!: string;

    @Column()
    dataOwnerPhoto?: string;

    @Column({ type: 'enum', enum: DatasetType })
    datasetType!: DatasetType;

    @Column({ type: 'text' })
    description?: string;

    @Column({ type: 'float' })
    updateFrequency!: number;

    @Column({ type: 'enum', enum: UpdateFrequencyUnit })
    updateFrequencyUnit!: UpdateFrequencyUnit;

    @Column({ type: 'text' })
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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;  // Soft delete column
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
}