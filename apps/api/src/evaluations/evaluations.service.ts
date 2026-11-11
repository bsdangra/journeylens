import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { executeJourney, generateReport } from '@journeylens/journey-engine';

import type {
  EvaluationReport,
  EvaluationRequest,
  EvaluationResult,
  ExecutionResult,
} from '@journeylens/contracts';

import { CatalogService } from '../catalog/catalog.service';

@Injectable()
export class EvaluationsService {
  constructor(private readonly catalog: CatalogService) {}

  /** Checks the request against the catalog; throws 400/404 when it doesn't match. */
  resolveRequest(body: Partial<EvaluationRequest> | undefined) {
    const journeyId = body?.journeyId;
    if (typeof journeyId !== 'string' || journeyId.trim() === '') {
      throw new BadRequestException('journeyId is required.');
    }
    const journey = this.catalog.getJourney(journeyId);

    const personaIds = body?.personaIds;
    if (
      !Array.isArray(personaIds) ||
      personaIds.length === 0 ||
      personaIds.some((id) => typeof id !== 'string')
    ) {
      throw new BadRequestException(
        'personaIds must be a non-empty list of persona IDs.',
      );
    }

    const available = this.catalog.listPersonas();
    const unknown = personaIds.filter(
      (id) => !available.some((persona) => persona.id === id),
    );
    if (unknown.length > 0) {
      throw new BadRequestException(
        `Unknown persona IDs: ${unknown.join(', ')}. Available personas: ${available
          .map((persona) => persona.id)
          .join(', ')}.`,
      );
    }

    const unique = [...new Set(personaIds)];
    const selected = unique.map(
      (id) => available.find((persona) => persona.id === id)!,
    );
    return { journey, personas: selected };
  }

  async runEvaluation(
    body: Partial<EvaluationRequest> | undefined,
  ): Promise<EvaluationResult> {
    const { journey, personas } = this.resolveRequest(body);
    const evaluationId = randomUUID();
    const createdAt = new Date().toISOString();

    const executions: ExecutionResult[] = [];
    const reports: EvaluationReport[] = [];

    for (const persona of personas) {
      const execution = await executeJourney(journey, evaluationId, persona.id);
      executions.push(execution);
      reports.push(generateReport(execution, persona));
    }

    return {
      id: evaluationId,
      websiteUrl: journey.startUrl,
      journeyId: journey.id,
      personaIds: personas.map((persona) => persona.id),
      status: executions.every((execution) => execution.status === 'completed')
        ? 'completed'
        : 'failed',
      createdAt,
      executions,
      reports,
    };
  }
}
