import { Injectable, NotFoundException } from '@nestjs/common';
import { journeys, personas } from '@journeylens/journey-engine';
import type {
  Journey,
  JourneySummary,
  Persona,
} from '@journeylens/contracts';

/**
 * Journeys and personas come from the journey engine's definitions until
 * they move to a database. Every screen and endpoint reads them from here.
 */
// Same rule the executor uses to redact values in its logs.
const SENSITIVE =
  /password|secret|token|api.?key|authorization|cookie|credit.?card|card.?number|cvv|ssn/i;

@Injectable()
export class CatalogService {
  listJourneys(): JourneySummary[] {
    return journeys.map(({ steps, ...journey }) => ({
      ...journey,
      stepCount: steps.length,
    }));
  }

  getJourney(id: string): Journey {
    const journey = journeys.find((item) => item.id === id);
    if (!journey) {
      throw new NotFoundException(
        `Journey with ID "${id}" was not found. Available journeys: ${journeys
          .map((item) => item.id)
          .join(', ')}.`,
      );
    }
    return journey;
  }

  /** The journey as shown to clients, with sensitive typed values masked. */
  getPublicJourney(id: string): Journey {
    const journey = this.getJourney(id);
    return {
      ...journey,
      steps: journey.steps.map((step) =>
        step.value && SENSITIVE.test(`${step.target ?? ''} ${step.description}`)
          ? { ...step, value: '••••••••' }
          : step,
      ),
    };
  }

  listPersonas(): Persona[] {
    return personas;
  }
}
