import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';
import { Dataset } from '../datasets/dataset.entity';

@Entity('access_requests')
export class AccessRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Dataset, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'datasetId' })
    dataset!: Dataset;

    @Column()
    jobTitle!: string;

    @Column()
    company!: string;

    @Column()
    contactEmail!: string;

    @Column({ nullable: true })
    department?: string;

    @Column({ type: 'text' })
    projectDescription!: string;

    @Column({ type: 'text' })
    usageDetails!: string;

    @Column({ type: 'timestamp', nullable: true })
    endTime?: Date;  // null means access never expires

    @Column({ type: 'timestamp', nullable: true })
    approvedAt?: Date;  // null means not yet approved

    @Column({ type: 'timestamp', nullable: true })
    deniedAt?: Date;  // null means not denied

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;  // Soft delete column

    // Helper methods for domain logic
    get isApproved(): boolean {
        return this.approvedAt !== null;
    }

    get isDenied(): boolean {
        return this.deniedAt !== null;
    }

    get isPending(): boolean {
        return this.approvedAt === null && this.deniedAt === null;
    }

    get isExpired(): boolean {
        if (!this.endTime) {
            return false; // No end time means access never expires
        }
        return new Date() > this.endTime;
    }

    get hasValidAccess(): boolean {
        return this.isApproved && !this.isDenied && !this.isExpired;
    }
}
