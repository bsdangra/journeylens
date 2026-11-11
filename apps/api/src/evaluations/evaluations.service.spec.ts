import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationsService } from './evaluations.service';

describe('EvaluationsService', () => {
  let service: EvaluationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationsService],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException for unknown journeyId', async () => {
    await expect(
      service.runEvaluation({ journeyId: 'non-existent-journey' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for invalid personaIds', async () => {
    await expect(
      service.runEvaluation({ personaIds: ['non-existent-persona'] }),
    ).rejects.toThrow(BadRequestException);
  });
});
