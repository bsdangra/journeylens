import { Body, Controller, Post } from '@nestjs/common';
import type { EvaluationRequest } from '@journeylens/contracts';
import { EvaluationsService } from './evaluations.service';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  runEvaluation(@Body() body: Partial<EvaluationRequest>) {
    return this.evaluationsService.runEvaluation(body);
  }
}
