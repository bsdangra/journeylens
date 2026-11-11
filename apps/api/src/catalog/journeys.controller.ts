import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('journeys')
export class JourneysController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list() {
    return this.catalog.listJourneys();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.catalog.getPublicJourney(id);
  }
}
