import { Controller, Get, Put, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PREDEFINED_SETTING_KEYS, Setting, SettingKey } from './settings.entity';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
    constructor(
        @InjectRepository(Setting)
        private readonly settingsRepository: Repository<Setting>,
    ) { }

    @Get()
    @ApiOperation({ summary: '[Public] Get all settings key-values' })
    async getAll() {
        const settings = await this.settingsRepository.find();
        const settingsMap = new Map(settings.map(s => [s.key, s]));
        const result: Record<string, any> = {};
        for (const key of PREDEFINED_SETTING_KEYS) {
            const setting = settingsMap.get(key);
            result[key] = setting ? setting.getParsedValue() : null;
        }
        return result;
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: '[Admin] Set a setting key' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    enum: PREDEFINED_SETTING_KEYS,
                    description: 'Setting key to update'
                },
                value: {
                    type: 'string',
                    description: 'Value to set (type depends on key)'
                }
            },
            required: ['key', 'value']
        },
        examples: {

        }
    })
    async setOne(@Body() body: { key: SettingKey; value: any }) {
        const { key, value } = body;
        if (!key || !PREDEFINED_SETTING_KEYS.includes(key)) {
            throw new HttpException('Invalid setting key', HttpStatus.BAD_REQUEST);
        }
        let setting = await this.settingsRepository.findOne({ where: { key } });
        if (!setting) {
            setting = this.settingsRepository.create({
                key,
                dataType: 'string' as any,
                description: '',
            });
        }
        setting.setValueFromObject(value);
        await this.settingsRepository.save(setting);
        return { key, value: setting.getParsedValue() };
    }
}
