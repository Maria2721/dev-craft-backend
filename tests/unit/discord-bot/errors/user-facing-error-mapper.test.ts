/**
 * Unit tests for mapUserFacingDifyError
 */

import { mapUserFacingDifyError } from '../../../../src/discord-bot/errors/user-facing-error-mapper';

describe('mapUserFacingDifyError', () => {
  it('maps speech-to-text disabled message', () => {
    const out = mapUserFacingDifyError(new Error('Speech to text is not enabled'));
    expect(out).toContain('speech recognition is disabled');
  });

  it('maps invalid provider message', () => {
    const out = mapUserFacingDifyError(new Error('Invalid provider xyz'));
    expect(out).toContain('Invalid provider');
  });

  it('returns generic message for unknown errors', () => {
    expect(mapUserFacingDifyError(new Error('other'))).toContain('temporarily unavailable');
    expect(mapUserFacingDifyError('string err')).toContain('temporarily unavailable');
  });
});
