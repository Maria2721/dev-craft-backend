/**
 * Unit tests for HealthController
 */

import { Test } from '@nestjs/testing';

import { HealthController } from '../../../../../src/presentation/api/health/health.controller';

describe('HealthController', () => {
  it('returns ok', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    const controller = moduleRef.get(HealthController);

    expect(controller.health()).toEqual({ ok: true });
  });
});
