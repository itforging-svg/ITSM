import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('assets')
@UseGuards(AuthGuard('jwt'))
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    create(@Body() assetData: any, @Request() req: any) {
        // Note: In real app, we'd get orgId from req.user
        return this.assetsService.create(assetData, req.user.orgId || 'default-org');
    }

    @Get()
    findAll(@Request() req: any) {
        return this.assetsService.findAll(req.user.orgId || 'default-org');
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.assetsService.findOne(id, req.user.orgId || 'default-org');
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateData: any, @Request() req: any) {
        return this.assetsService.update(id, req.user.orgId || 'default-org', updateData);
    }
}
