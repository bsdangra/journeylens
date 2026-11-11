import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('personas')
export class PersonasController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list() {
    return this.catalog.listPersonas();
  }
}
