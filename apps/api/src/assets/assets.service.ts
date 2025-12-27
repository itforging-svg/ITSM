import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(Asset)
        private assetsRepository: Repository<Asset>,
    ) { }

    async create(assetData: Partial<Asset>, orgId: string): Promise<Asset> {
        const asset = this.assetsRepository.create({
            ...assetData,
            org_id: orgId,
        });
        return this.assetsRepository.save(asset);
    }

    async findAll(orgId: string): Promise<Asset[]> {
        return this.assetsRepository.find({
            where: { org_id: orgId },
            relations: ['owner']
        });
    }

    async findOne(id: string, orgId: string): Promise<Asset> {
        const asset = await this.assetsRepository.findOne({
            where: { id, org_id: orgId },
            relations: ['owner']
        });
        if (!asset) throw new NotFoundException(`Asset #${id} not found`);
        return asset;
    }

    async findBySerial(serial: string, orgId: string): Promise<Asset | null> {
        return this.assetsRepository.findOne({ where: { serial_number: serial, org_id: orgId } });
    }

    async update(id: string, orgId: string, updateData: Partial<Asset>): Promise<Asset> {
        const asset = await this.findOne(id, orgId);
        Object.assign(asset, updateData);
        return this.assetsRepository.save(asset);
    }
}
