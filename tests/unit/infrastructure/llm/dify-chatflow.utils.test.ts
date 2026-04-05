/**
 * Unit tests for dify-chatflow utils
 */

import {
  AI_TRUNCATION_SUFFIX,
  MAX_CODE_SNIPPET_LENGTH,
} from '../../../../src/application/ai/ai-chat.constants';
import {
  buildDifyChatflowInputs,
  resolveDifyEndUser,
} from '../../../../src/infrastructure/llm/dify-chatflow.utils';
import { DIFY_END_USER_PREFIX } from '../../../../src/infrastructure/llm/dify-chatflow.constants';

describe('resolveDifyEndUser', () => {
  const saved = process.env.AI_DIFY_END_USER;

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.AI_DIFY_END_USER;
    } else {
      process.env.AI_DIFY_END_USER = saved;
    }
  });

  it('uses AI_DIFY_END_USER when set', () => {
    process.env.AI_DIFY_END_USER = '  fixed-user  ';
    expect(resolveDifyEndUser(99)).toBe('fixed-user');
  });

  it('falls back to prefix and user id', () => {
    delete process.env.AI_DIFY_END_USER;
    expect(resolveDifyEndUser(7)).toBe(`${DIFY_END_USER_PREFIX}7`);
  });
});

describe('buildDifyChatflowInputs', () => {
  it('returns empty object when context is undefined', () => {
    expect(buildDifyChatflowInputs()).toEqual({});
  });

  it('maps title and description', () => {
    expect(
      buildDifyChatflowInputs({
        taskTitle: 'T',
        taskDescription: 'D',
      }),
    ).toEqual({ task_title: 'T', task_description: 'D' });
  });

  it('truncates long code snippet', () => {
    const long = 'x'.repeat(MAX_CODE_SNIPPET_LENGTH + 100);
    const inputs = buildDifyChatflowInputs({ codeSnippet: long });
    expect(inputs.code_snippet).toHaveLength(MAX_CODE_SNIPPET_LENGTH + AI_TRUNCATION_SUFFIX.length);
    expect(inputs.code_snippet.endsWith(AI_TRUNCATION_SUFFIX)).toBe(true);
  });

  it('does not truncate short snippet', () => {
    expect(buildDifyChatflowInputs({ codeSnippet: 'ok' }).code_snippet).toBe('ok');
  });
});
