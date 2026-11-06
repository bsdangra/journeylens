import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { TriggerEvaluationRequestDto } from './dto/trigger-evaluation.dto';

@Controller('evaluations')
export class EvaluationsController {
  constructor(
    private readonly evaluationsService: EvaluationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  runEvaluation(@Body() dto?: TriggerEvaluationRequestDto) {
    console.log('[EvaluationsController] >>> POST /evaluations received with payload:', dto);
    return this.evaluationsService.runEvaluation(dto);
  }
}
