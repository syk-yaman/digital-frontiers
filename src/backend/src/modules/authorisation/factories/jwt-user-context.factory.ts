import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContext } from '../user-context';
import { UserRole } from '../enums/user-roles.enum';
import { User } from 'src/modules/users/user.entity';

/**
 * JwtUserContextFactory
 * 
 * Factory service responsible for creating UserContext objects from different sources:
 * - HTTP requests with JWT authentication
 * - User IDs from the database
 * - Anonymous/public contexts
 * 
 * This factory bridges the authentication system with the authorisation system
 * by translating user identity information into UserContext objects.
 */
@Injectable()
export class JwtUserContextFactory {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    /**
     * Creates a UserContext from an HTTP request containing JWT user information
     * 
     * @param req - The HTTP request with JWT user payload attached
     * @returns A UserContext object representing the authenticated user
     * @throws Error if user information is not found in the request
     */
    createFromRequest(req: any): UserContext | undefined {
        if (!req.user) {
            throw new Error('User not found in request');
        }
        console.log('User found in request:', req.user);
        const { userId, isAdmin } = req.user;

        // Default role for authenticated users
        const roles = [UserRole.GENERAL_USER];

        // Add admin role if user is an admin
        if (isAdmin) {
            roles.push(UserRole.ADMIN);
        }

        return new UserContext(userId, roles);
    }

    /**
     * Creates a UserContext by looking up a user by ID in the database
     * 
     * @param userId - The unique identifier of the user
     * @returns A UserContext representing the user, or a public context if user not found
     */
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
            //user.controlledDatasetIds || []
        );
    }

    /**
     * Creates a UserContext for unauthenticated public visitors
     * 
     * @returns A UserContext with public visitor permissions
     */
    createPublicContext(): UserContext {
        return new UserContext(null);
    }
}