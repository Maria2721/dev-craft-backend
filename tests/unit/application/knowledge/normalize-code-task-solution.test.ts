/**
 * Unit tests for normalizeCodeTaskSolution
 */

import { normalizeCodeTaskSolution } from '../../../../src/application/knowledge/normalize-code-task-solution';

describe('normalizeCodeTaskSolution', () => {
  it('normalizes CRLF and trims trailing spaces per line', () => {
    expect(normalizeCodeTaskSolution('a  \r\nb\t  \nc')).toBe('a\nb\nc');
  });

  it('normalizes lone CR and trims outer whitespace', () => {
    expect(normalizeCodeTaskSolution('  x\rz  ')).toBe('x\nz');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeCodeTaskSolution('  \n  \t  ')).toBe('');
  });
});
