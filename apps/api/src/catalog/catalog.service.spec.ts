import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  const catalog = new CatalogService();

  it('lists journeys with step counts and no steps', () => {
    const [journey] = catalog.listJourneys();
    expect(journey).toMatchObject({ id: 'JL-JRN-001', stepCount: 12 });
    expect(journey).not.toHaveProperty('steps');
  });

  it('masks sensitive values in the public journey only', () => {
    const findPassword = (id: string, getter: 'getJourney' | 'getPublicJourney') =>
      catalog[getter](id).steps.find((step) => /password/i.test(step.description));

    expect(findPassword('JL-JRN-001', 'getPublicJourney')?.value).toBe('••••••••');
    expect(findPassword('JL-JRN-001', 'getJourney')?.value).not.toBe('••••••••');
  });

  it('throws 404 for an unknown journey', () => {
    expect(() => catalog.getJourney('nope')).toThrow(NotFoundException);
  });
});
