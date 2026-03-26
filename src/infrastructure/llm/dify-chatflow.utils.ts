import {
  AI_TRUNCATION_SUFFIX,
  MAX_CODE_SNIPPET_LENGTH,
} from '../../application/ai/ai-chat.constants';
import { DIFY_END_USER_PREFIX } from './dify-chatflow.constants';

export type DifyChatflowContextInput = {
  taskTitle?: string;
  taskDescription?: string;
  codeSnippet?: string;
};

export function resolveDifyEndUser(userId: number): string {
  const fromEnv = process.env.AI_DIFY_END_USER?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return `${DIFY_END_USER_PREFIX}${userId}`;
}

export function buildDifyChatflowInputs(
  context?: DifyChatflowContextInput,
): Record<string, string> {
  const inputs: Record<string, string> = {};
  if (context?.taskTitle) {
    inputs.task_title = context.taskTitle;
  }
  if (context?.taskDescription) {
    inputs.task_description = context.taskDescription;
  }
  if (context?.codeSnippet) {
    const snippet =
      context.codeSnippet.length > MAX_CODE_SNIPPET_LENGTH
        ? context.codeSnippet.slice(0, MAX_CODE_SNIPPET_LENGTH) + AI_TRUNCATION_SUFFIX
        : context.codeSnippet;
    inputs.code_snippet = snippet;
  }
  return inputs;
}
