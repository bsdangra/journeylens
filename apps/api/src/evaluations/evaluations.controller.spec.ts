import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';

describe('EvaluationsController', () => {
  let controller: EvaluationsController;
  let service: EvaluationsService;

  const mockEvaluationResponse = {
    id: 'test-evaluation-id',
    websiteUrl: 'https://www.saucedemo.com/',
    journeyId: 'JL-JRN-001',
    status: 'completed' as const,
    createdAt: new Date().toISOString(),
    executions: [],
    reports: [],
  };

  const mockEvaluationsService = {
    runEvaluation: jest.fn().mockResolvedValue(mockEvaluationResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationsController],
      providers: [
        {
          provide: EvaluationsService,
          useValue: mockEvaluationsService,
        },
      ],
    }).compile();

    controller = module.get<EvaluationsController>(EvaluationsController);
    service = module.get<EvaluationsService>(EvaluationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should trigger evaluation with dto', async () => {
    const dto = { journeyId: 'JL-JRN-001' };
    const result = await controller.runEvaluation(dto);

    expect(service.runEvaluation).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockEvaluationResponse);
  });
});
