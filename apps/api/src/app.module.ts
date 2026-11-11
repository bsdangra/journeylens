import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogModule } from './catalog/catalog.module';
import { EvaluationsModule } from './evaluations/evaluations.module';

@Module({
  imports: [CatalogModule, EvaluationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
