import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from '../catalog/catalog.service';
import { EvaluationsService } from './evaluations.service';

describe('EvaluationsService', () => {
  let service: EvaluationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluationsService, CatalogService],
    }).compile();

    service = module.get<EvaluationsService>(EvaluationsService);
  });

  it('resolves a known journey and personas', () => {
    const { journey, personas } = service.resolveRequest({
      journeyId: 'JL-JRN-001',
      personaIds: ['first-time-shopper', 'first-time-shopper'],
    });
    expect(journey.id).toBe('JL-JRN-001');
    expect(personas.map((persona) => persona.id)).toEqual([
      'first-time-shopper',
    ]);
  });

  it('rejects a missing journeyId', () => {
    expect(() => service.resolveRequest({ personaIds: ['x'] })).toThrow(
      BadRequestException,
    );
  });

  it('returns 404 for an unknown journey', () => {
    expect(() =>
      service.resolveRequest({
        journeyId: 'JL-JRN-999',
        personaIds: ['first-time-shopper'],
      }),
    ).toThrow(NotFoundException);
  });

  it('rejects empty or unknown personas', () => {
    expect(() =>
      service.resolveRequest({ journeyId: 'JL-JRN-001', personaIds: [] }),
    ).toThrow(BadRequestException);
    expect(() =>
      service.resolveRequest({
        journeyId: 'JL-JRN-001',
        personaIds: ['senior-citizen'],
      }),
    ).toThrow(/Unknown persona IDs: senior-citizen/);
  });
});
