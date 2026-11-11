import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JourneysController } from './journeys.controller';
import { PersonasController } from './personas.controller';

@Module({
  controllers: [JourneysController, PersonasController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
