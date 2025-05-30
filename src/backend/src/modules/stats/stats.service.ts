import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Not } from 'typeorm';
import { User } from '../users/user.entity';
import { Dataset, DatasetType, UpdateFrequencyUnit } from '../datasets/dataset.entity';

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Dataset)
        private datasetsRepository: Repository<Dataset>,
    ) { }

    async getAdminHomeStats() {
        // User growth: count users per month for the last 7 months
        const userGrowth = await this.usersRepository.query(`
      SELECT 
        to_char("createdAt", 'YYYY-MM') as date,
        COUNT(*) as count
      FROM users
      GROUP BY date
      ORDER BY date ASC
      LIMIT 7
    `);

        // Total users
        const totalUsers = await this.usersRepository.count();

        // Datasets added
        const totalDatasets = await this.datasetsRepository.count();

        // Live datasets 
        const liveDatasets = await this.datasetsRepository.count({ where: { updateFrequencyUnit: Not(UpdateFrequencyUnit.ONLY_ONCE) } });

        // Approved datasets percent
        const approvedDatasets = await this.datasetsRepository.count({ where: { approvedAt: MoreThan(new Date('1970-01-01')) } });
        const approvedPercent = totalDatasets > 0 ? Math.round((approvedDatasets / totalDatasets) * 100) : 0;

        return {
            userGrowth: userGrowth.map((row: any) => ({ date: row.date, count: Number(row.count) })),
            totalUsers,
            totalDatasets,
            liveDatasets,
            approvedPercent,
        };
    }
}
