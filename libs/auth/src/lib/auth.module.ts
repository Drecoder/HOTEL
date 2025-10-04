import { Module } from '@nestjs/common';
import { AuthService } from '.';
import { GqlAuthGuard } from './gql-auth.guard';
import { RolesGuard } from './roles.guard';
// NOTE: In a full app, you would import TypeOrmModule and the User entity here.

@Module({
  // The guards and service are provided here
  providers: [AuthService, GqlAuthGuard, RolesGuard],
  // The service and guards are exported so other modules (like Room/Booking) can use them via @UseGuards()
  exports: [AuthService, GqlAuthGuard, RolesGuard], 
})
export class AuthModule {}
