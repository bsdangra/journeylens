import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import {
  executeJourney,
  purchaseJourney,
  getJourneyById,
  availableJourneys,
  getPersonas,
  generateReport,
} from '@journeylens/journey-engine';

import type {
  ExecutionResult,
  EvaluationReport,
  TriggerEvaluationDto,
  EvaluationResultResponse,
} from '@journeylens/contracts';

@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);

  async runEvaluation(
    dto?: TriggerEvaluationDto,
  ): Promise<EvaluationResultResponse> {
    const journeyId = dto?.journeyId || purchaseJourney.id;
    const baseJourney = getJourneyById(journeyId);

    if (!baseJourney) {
      const available = availableJourneys.map((j) => j.id).join(', ');
      throw new NotFoundException(
        `Journey with ID '${journeyId}' was not found. Available journeys: ${available}`,
      );
    }

    // Apply URL override if specified, updating both startUrl and the initial navigate step
    const journey = dto?.websiteUrl
      ? {
          ...baseJourney,
          startUrl: dto.websiteUrl,
          steps: baseJourney.steps.map((step, idx) =>
            idx === 0 && step.action === 'navigate'
              ? { ...step, value: dto.websiteUrl }
              : step,
          ),
        }
      : baseJourney;

    const targetPersonas = getPersonas(dto?.personaIds);
    if (!targetPersonas || targetPersonas.length === 0) {
      throw new BadRequestException('No valid personas selected for evaluation.');
    }

    const evaluationId = randomUUID();
    const executions: ExecutionResult[] = [];
    const reports: EvaluationReport[] = [];

    this.logger.log(
      `Starting evaluation ${evaluationId} for journey ${journey.id} across ${targetPersonas.length} persona(s)`,
    );

    try {
      for (const persona of targetPersonas) {
        this.logger.log(
          `Executing persona '${persona.name}' (${persona.id})`,
        );

        const execution = await executeJourney(
          journey,
          evaluationId,
          persona.id,
        );

        executions.push(execution);

        const report = generateReport(execution, persona);
        reports.push(report);
      }
    } catch (error) {
      this.logger.error(
        `Failed executing evaluation ${evaluationId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Evaluation execution failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      id: evaluationId,
      websiteUrl: journey.startUrl,
      journeyId: journey.id,
      status: executions.every(
        (execution) => execution.status === 'completed',
      )
        ? 'completed'
        : 'failed',
      createdAt: new Date().toISOString(),
      executions,
      reports,
    };
  }
}
