/**
 * Unit tests for buildCodeTaskAiCheckPrompt
 */

import { MAX_CODE_SNIPPET_LENGTH } from '../../../../src/application/ai/ai-chat.constants';
import { buildCodeTaskAiCheckPrompt } from '../../../../src/application/knowledge/code-task-ai-check.constants';

describe('buildCodeTaskAiCheckPrompt', () => {
  it('includes title, description, and truncates long code', () => {
    const longRef = 'r'.repeat(MAX_CODE_SNIPPET_LENGTH + 50);
    const longUser = 'u'.repeat(MAX_CODE_SNIPPET_LENGTH + 30);
    const prompt = buildCodeTaskAiCheckPrompt({
      title: 'Title',
      description: 'Desc',
      referenceSolution: longRef,
      userCode: longUser,
    });
    expect(prompt).toContain('Title');
    expect(prompt).toContain('Desc');
    expect(prompt).toContain('...');
    expect(prompt.length).toBeGreaterThan(500);
  });

  it('embeds short solutions without truncation marker in body', () => {
    const prompt = buildCodeTaskAiCheckPrompt({
      title: 'T',
      description: 'D',
      referenceSolution: 'ref',
      userCode: 'usr',
    });
    expect(prompt).toContain('ref');
    expect(prompt).toContain('usr');
    expect(prompt).toContain('"valid": boolean');
  });
});
