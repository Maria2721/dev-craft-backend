/**
 * Unit tests for CodeTaskAiCheckReplyParser
 */

import { CodeTaskAiCheckParseError } from '../../../../src/application/knowledge/code-task-ai-check-parse.error';
import { CodeTaskAiCheckReplyParser } from '../../../../src/application/knowledge/parse-code-task-ai-check-reply';

describe('CodeTaskAiCheckReplyParser', () => {
  it('parses bare JSON object', () => {
    const raw = '{"valid":true,"hints":"h","justification":"j","improvements":"i"}';
    const r = CodeTaskAiCheckReplyParser.parse(raw);
    expect(r).toEqual({
      valid: true,
      hints: 'h',
      justification: 'j',
      improvements: 'i',
    });
  });

  it('strips markdown json fence', () => {
    const raw = '```json\n{ "valid": false }\n```';
    const r = CodeTaskAiCheckReplyParser.parse(raw);
    expect(r.valid).toBe(false);
    expect(r.hints).toBeNull();
  });

  it('throws on invalid JSON', () => {
    expect(() => CodeTaskAiCheckReplyParser.parse('not json')).toThrow(CodeTaskAiCheckParseError);
    expect(() => CodeTaskAiCheckReplyParser.parse('not json')).toThrow('Invalid JSON');
  });

  it('throws when root is not an object', () => {
    expect(() => CodeTaskAiCheckReplyParser.parse('[]')).toThrow('Root must be an object');
    expect(() => CodeTaskAiCheckReplyParser.parse('null')).toThrow('Root must be an object');
  });

  it('throws when valid is missing or not boolean', () => {
    expect(() => CodeTaskAiCheckReplyParser.parse('{}')).toThrow('Missing or invalid "valid"');
    expect(() => CodeTaskAiCheckReplyParser.parse('{"valid":"yes"}')).toThrow(
      'Missing or invalid "valid"',
    );
  });

  it('treats non-string optional fields as null', () => {
    const r = CodeTaskAiCheckReplyParser.parse(
      '{"valid":true,"hints":1,"justification":{},"improvements":null}',
    );
    expect(r.hints).toBeNull();
    expect(r.justification).toBeNull();
    expect(r.improvements).toBeNull();
  });

  it('treats empty string hints as null', () => {
    const r = CodeTaskAiCheckReplyParser.parse('{"valid":true,"hints":"  "}');
    expect(r.hints).toBeNull();
  });
});
