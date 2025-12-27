import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
