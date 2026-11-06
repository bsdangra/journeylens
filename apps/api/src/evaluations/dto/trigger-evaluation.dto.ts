import type { TriggerEvaluationDto } from '@journeylens/contracts';

export class TriggerEvaluationRequestDto implements TriggerEvaluationDto {
  journeyId?: string;
  websiteUrl?: string;
  personaIds?: string[];
}

