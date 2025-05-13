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
    Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Dataset } from '../datasets/dataset.entity';

@Entity('showcases')
export class Showcase {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Index({ unique: true })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ nullable: true })
    youtubeLink?: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Dataset, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'datasetId' })
    dataset?: Dataset;

    @OneToMany(() => ShowcaseSliderImage, (image) => image.showcase, { cascade: true, onDelete: 'CASCADE' })
    sliderImages!: ShowcaseSliderImage[];

    @OneToMany(() => ShowcaseLocation, (location) => location.showcase, { cascade: true, onDelete: 'CASCADE' })
    locations?: ShowcaseLocation[];

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
    get isApproved(): boolean {
        return this.approvedAt !== null;
    }

    isOwnedBy(userId: string): boolean {
        return this.user.id === userId;
    }

    // Method to get the teaser image
    getTeaserImage(): ShowcaseSliderImage | undefined {
        return this.sliderImages?.find(image => image.isTeaser);
    }
}

@Entity('showcase_slider_images')
export class ShowcaseSliderImage {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Showcase, (showcase) => showcase.sliderImages, { onDelete: 'CASCADE', nullable: false })
    showcase!: Showcase;

    @Column()
    fileName!: string;

    @Column({ default: false })
    isTeaser!: boolean;
}

@Entity('showcase_locations')
export class ShowcaseLocation {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Showcase, (showcase) => showcase.locations, { onDelete: 'CASCADE', nullable: false })
    showcase!: Showcase;

    @Column({ type: 'float' })
    lon!: number;

    @Column({ type: 'float' })
    lat!: number;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    imageLink?: string;

    @Column({ nullable: true })
    linkTitle?: string;

    @Column({ nullable: true })
    linkAddress?: string;
}
