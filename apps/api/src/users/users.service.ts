import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Organization } from './entities/organization.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Organization)
        private orgRepository: Repository<Organization>,
    ) { }

    async findOne(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async create(user: Partial<User>): Promise<User> {
        const newUser = this.usersRepository.create(user);
        return this.usersRepository.save(newUser);
    }

    async createAdmin(email: string, password_hash: string, orgName: string, fullName: string): Promise<User> {
        // 1. Create Org
        const org = this.orgRepository.create({
            name: orgName,
            domain: email.split('@')[1], // Simple domain extraction
        });
        await this.orgRepository.save(org);

        // 2. Create User
        const user = this.usersRepository.create({
            email,
            password_hash, // In real app, hash this before passing or here
            full_name: fullName,
            role: UserRole.ADMIN,
            organization: org
        });
        return this.usersRepository.save(user);
    }
}
