import { CodeTaskAiCheckParseError } from './code-task-ai-check-parse.error';

export type ParsedCodeTaskAiCheck = {
  valid: boolean;
  hints: string | null;
  justification: string | null;
  improvements: string | null;
};

export class CodeTaskAiCheckReplyParser {
  static parse(raw: string): ParsedCodeTaskAiCheck {
    const inner = this.stripJsonFence(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(inner) as unknown;
    } catch {
      throw new CodeTaskAiCheckParseError('Invalid JSON');
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new CodeTaskAiCheckParseError('Root must be an object');
    }
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.valid !== 'boolean') {
      throw new CodeTaskAiCheckParseError('Missing or invalid "valid"');
    }
    return {
      valid: obj.valid,
      hints: this.optionalString(obj.hints),
      justification: this.optionalString(obj.justification),
      improvements: this.optionalString(obj.improvements),
    };
  }

  private static stripJsonFence(raw: string): string {
    const trimmed = raw.trim();
    const fence = /^```(?:json)?\s*\n?([\s\S]*?)```\s*$/im;
    const m = trimmed.match(fence);
    if (m) {
      return m[1].trim();
    }
    return trimmed;
  }

  private static optionalString(value: unknown): string | null {
    if (value == null) {
      return null;
    }
    if (typeof value !== 'string') {
      return null;
    }
    const s = value.trim();
    return s === '' ? null : s;
  }
}
