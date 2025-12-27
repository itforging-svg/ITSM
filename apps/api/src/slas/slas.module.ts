import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlasService } from './slas.service';
import { Sla } from './entities/sla.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sla])],
  providers: [SlasService],
  exports: [SlasService],
})
export class SlasModule { }
