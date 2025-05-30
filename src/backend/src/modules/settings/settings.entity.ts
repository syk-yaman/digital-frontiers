import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    Check
} from 'typeorm';

/**
 * Enum defining the data types that can be stored in the settings
 */
export enum SettingDataType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    JSON = 'json',
    HTML = 'html'
}

export enum SettingKey {
    HERO_SECONDARY_TEXT = 'hero_secondary_text',
    HERO_MAIN_TEXT = 'hero_main_text',
    DATASET_SUBMISSION_MESSAGE = 'dataset_submission_message',
    TERMS_AND_CONDITIONS = 'terms_and_conditions',
    PARTNERS = 'partners',
    ABOUT = 'about',
}

export const PREDEFINED_SETTING_KEYS: SettingKey[] = [
    SettingKey.HERO_SECONDARY_TEXT,
    SettingKey.HERO_MAIN_TEXT,
    SettingKey.DATASET_SUBMISSION_MESSAGE,
    SettingKey.TERMS_AND_CONDITIONS,
    SettingKey.PARTNERS,
    SettingKey.ABOUT,
];

@Entity('settings')
@Check(`"dataType" IN ('string', 'number', 'boolean', 'json', 'html')`)
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Index()
    key: string;

    @Column({ type: 'text', nullable: true })
    value: string;

    @Column({
        type: 'enum',
        enum: SettingDataType,
        default: SettingDataType.STRING
    })
    dataType: SettingDataType;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    getParsedValue(): any {
        if (this.value === null || this.value === undefined) return null;
        switch (this.dataType) {
            case 'boolean':
                return this.value === 'true';
            case 'number':
                return Number(this.value);
            case 'json':
                try { return JSON.parse(this.value); } catch { return null; }
            default:
                return this.value;
        }
    }

    setValueFromObject(value: any): void {
        if (value === undefined || value === null) {
            this.value = null;
            return;
        }
        if (this.dataType === 'json') {
            this.value = JSON.stringify(value);
        } else {
            this.value = String(value);
        }
    }
}
