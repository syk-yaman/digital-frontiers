import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContext } from '../user-context';
import { UserRole } from '../enums/user-roles.enum';
import { User } from 'src/modules/users/user.entity';

@Injectable()
export class JwtUserContextFactory {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    createFromRequest(req: any): UserContext | undefined {
        if (!req.user) {
            return undefined;
        }

        const { userId, isAdmin } = req.user;

        // Default role for authenticated users
        const roles = [UserRole.USER];

        // Add admin role if user is an admin
        if (isAdmin) {
            roles.push(UserRole.ADMIN);
        }

        return new UserContext(userId, roles);
    }

    async createFromUserId(userId: string): Promise<UserContext> {
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            return new UserContext(null);
        }

        const roles = user.roles.map(role => role as UserRole);

        if (user.isAdmin && !roles.includes(UserRole.ADMIN)) {
            roles.push(UserRole.ADMIN);
        }

        return new UserContext(
            user.id,
            roles,
            user.controlledDatasetIds || []
        );
    }

    createPublicContext(): UserContext {
        return new UserContext(null);
    }
}