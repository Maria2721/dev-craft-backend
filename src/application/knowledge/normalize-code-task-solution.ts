export function normalizeCodeTaskSolution(value: string): string {
  const withLf = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = withLf.split('\n').map((line) => line.replace(/\s+$/u, ''));
  return lines.join('\n').trim();
}
