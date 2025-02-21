import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserType {
    ACADEMIC = 'academic',
    BUSINESS_OWNER = 'business_owner',
    CORPORATE = 'corporate',
    ENTHUSIAST = 'enthusiast',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    company!: string;

    @Column({ select: false })
    password!: string;

    @Column({ type: 'enum', enum: UserType })
    type!: UserType;

    @Column({ default: false })
    isAdmin!: boolean;

    @Column({ default: false })
    isVerified!: boolean;

    @Column({ nullable: true })
    emailVerificationToken?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @BeforeInsert()
    async hashPassword() {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
}
