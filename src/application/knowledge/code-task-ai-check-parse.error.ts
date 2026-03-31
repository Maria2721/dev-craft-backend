export class CodeTaskAiCheckParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CodeTaskAiCheckParseError';
  }
}
