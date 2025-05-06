import { Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
//This decorator can be used in the case of user-aware endpoints that 
//accept both signed-in and not signed-in users.
export class OptionalJwtAuthGuard extends JwtAuthGuard {
    handleRequest(err: any, user: any, info: any) {
        // Return the user if authenticated, otherwise null
        return user || null;
    }
}