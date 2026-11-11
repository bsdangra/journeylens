import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from '../catalog/catalog.service';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';

describe('EvaluationsController', () => {
  let controller: EvaluationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationsController],
      providers: [EvaluationsService, CatalogService],
    }).compile();

    controller = module.get<EvaluationsController>(EvaluationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
