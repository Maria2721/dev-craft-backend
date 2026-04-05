/**
 * Unit tests for JwtAuthGuard
 */

import { JwtAuthGuard } from '../../../../src/presentation/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('is constructable', () => {
    expect(new JwtAuthGuard()).toBeInstanceOf(JwtAuthGuard);
  });
});
