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

/**
 * Enum defining known setting keys to provide type safety when accessing settings
 */
export enum SettingKey {
    // Homepage Settings
    FEATURED_DATASETS = 'featured_datasets',
    HERO_DATASETS = 'hero_datasets',
    HERO_SECONDARY_TEXT = 'hero_secondary_text',
    HERO_MAIN_TEXT = 'hero_main_text',

    // User Messages
    DATASET_SUBMISSION_MESSAGE = 'dataset_submission_message',

    // Legal Content
    TERMS_AND_CONDITIONS = 'terms_and_conditions',
    PRIVACY_POLICY = 'privacy_policy',

    // Other site settings can be added here
    SITE_NAME = 'site_name',
    CONTACT_EMAIL = 'contact_email',
    MAINTENANCE_MODE = 'maintenance_mode',
}

/**
 * Type mapping for setting keys to enforce correct data types
 */
export interface SettingTypeMap {
    [SettingKey.FEATURED_DATASETS]: number[]; // Array of dataset IDs
    [SettingKey.HERO_DATASETS]: number[]; // Array of dataset IDs for hero section
    [SettingKey.HERO_SECONDARY_TEXT]: string;
    [SettingKey.HERO_MAIN_TEXT]: string;
    [SettingKey.DATASET_SUBMISSION_MESSAGE]: string;
    [SettingKey.TERMS_AND_CONDITIONS]: string; // HTML content
    [SettingKey.PRIVACY_POLICY]: string; // HTML content
    [SettingKey.SITE_NAME]: string;
    [SettingKey.CONTACT_EMAIL]: string;
    [SettingKey.MAINTENANCE_MODE]: boolean;
}

/**
 * Default values for settings
 */
export const DEFAULT_SETTINGS: Record<SettingKey, any> = {
    [SettingKey.FEATURED_DATASETS]: [],
    [SettingKey.HERO_DATASETS]: [],
    [SettingKey.HERO_SECONDARY_TEXT]: "Discover and share datasets",
    [SettingKey.HERO_MAIN_TEXT]: "Welcome to our data platform",
    [SettingKey.DATASET_SUBMISSION_MESSAGE]: "Thank you for submitting your dataset. It will be reviewed by our team.",
    [SettingKey.TERMS_AND_CONDITIONS]: "<h1>Terms and Conditions</h1><p>Default terms and conditions.</p>",
    [SettingKey.PRIVACY_POLICY]: "<h1>Privacy Policy</h1><p>Default privacy policy.</p>",
    [SettingKey.SITE_NAME]: "Data Platform",
    [SettingKey.CONTACT_EMAIL]: "contact@example.com",
    [SettingKey.MAINTENANCE_MODE]: false,
};

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

    /**
     * Parse the string value based on its data type
     */
    getParsedValue<K extends SettingKey>(): SettingTypeMap[K] | null {
        if (this.value === null || this.value === undefined) {
            return null;
        }

        try {
            switch (this.dataType) {
                case SettingDataType.STRING:
                case SettingDataType.HTML:
                    return this.value as any;
                case SettingDataType.NUMBER:
                    return Number(this.value) as any;
                case SettingDataType.BOOLEAN:
                    return (this.value.toLowerCase() === 'true') as any;
                case SettingDataType.JSON:
                    return JSON.parse(this.value) as any;
                default:
                    return this.value as any;
            }
        } catch (error) {
            console.error(`Error parsing setting ${this.key}:`, error);
            return null;
        }
    }

    /**
     * Set the value, converting it to string based on its data type
     */
    setValueFromObject<K extends SettingKey>(value: SettingTypeMap[K]): void {
        if (value === undefined || value === null) {
            this.value = null;
            return;
        }

        switch (this.dataType) {
            case SettingDataType.STRING:
            case SettingDataType.HTML:
                this.value = String(value);
                break;
            case SettingDataType.NUMBER:
                this.value = String(Number(value));
                break;
            case SettingDataType.BOOLEAN:
                this.value = String(Boolean(value));
                break;
            case SettingDataType.JSON:
                this.value = JSON.stringify(value);
                break;
            default:
                this.value = String(value);
        }
    }
}

/**
 * Helper class to define setting metadata for creating or updating settings
 */
export class SettingDefinition<K extends SettingKey> {
    constructor(
        public readonly key: K,
        public readonly dataType: SettingDataType,
        public readonly defaultValue: SettingTypeMap[K],
        public readonly description: string
    ) { }
}

/**
 * Predefined setting definitions
 */
export const SETTING_DEFINITIONS: Record<SettingKey, SettingDefinition<any>> = {
    [SettingKey.FEATURED_DATASETS]: new SettingDefinition(
        SettingKey.FEATURED_DATASETS,
        SettingDataType.JSON,
        DEFAULT_SETTINGS[SettingKey.FEATURED_DATASETS],
        "List of featured dataset IDs for the homepage"
    ),
    [SettingKey.HERO_DATASETS]: new SettingDefinition(
        SettingKey.HERO_DATASETS,
        SettingDataType.JSON,
        DEFAULT_SETTINGS[SettingKey.HERO_DATASETS],
        "List of dataset IDs for the hero section"
    ),
    [SettingKey.HERO_SECONDARY_TEXT]: new SettingDefinition(
        SettingKey.HERO_SECONDARY_TEXT,
        SettingDataType.STRING,
        DEFAULT_SETTINGS[SettingKey.HERO_SECONDARY_TEXT],
        "Secondary text displayed under the slider"
    ),
    [SettingKey.HERO_MAIN_TEXT]: new SettingDefinition(
        SettingKey.HERO_MAIN_TEXT,
        SettingDataType.STRING,
        DEFAULT_SETTINGS[SettingKey.HERO_MAIN_TEXT],
        "Main text displayed under the slider"
    ),
    [SettingKey.DATASET_SUBMISSION_MESSAGE]: new SettingDefinition(
        SettingKey.DATASET_SUBMISSION_MESSAGE,
        SettingDataType.STRING,
        DEFAULT_SETTINGS[SettingKey.DATASET_SUBMISSION_MESSAGE],
        "Message shown to users after submitting a dataset"
    ),
    [SettingKey.TERMS_AND_CONDITIONS]: new SettingDefinition(
        SettingKey.TERMS_AND_CONDITIONS,
        SettingDataType.HTML,
        DEFAULT_SETTINGS[SettingKey.TERMS_AND_CONDITIONS],
        "Website terms and conditions (HTML content)"
    ),
    [SettingKey.PRIVACY_POLICY]: new SettingDefinition(
        SettingKey.PRIVACY_POLICY,
        SettingDataType.HTML,
        DEFAULT_SETTINGS[SettingKey.PRIVACY_POLICY],
        "Website privacy policy (HTML content)"
    ),
    [SettingKey.SITE_NAME]: new SettingDefinition(
        SettingKey.SITE_NAME,
        SettingDataType.STRING,
        DEFAULT_SETTINGS[SettingKey.SITE_NAME],
        "Name of the website"
    ),
    [SettingKey.CONTACT_EMAIL]: new SettingDefinition(
        SettingKey.CONTACT_EMAIL,
        SettingDataType.STRING,
        DEFAULT_SETTINGS[SettingKey.CONTACT_EMAIL],
        "Contact email address"
    ),
    [SettingKey.MAINTENANCE_MODE]: new SettingDefinition(
        SettingKey.MAINTENANCE_MODE,
        SettingDataType.BOOLEAN,
        DEFAULT_SETTINGS[SettingKey.MAINTENANCE_MODE],
        "Whether the site is in maintenance mode"
    ),
};
