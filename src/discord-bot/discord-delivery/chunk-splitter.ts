/** Discord REST API rejects `content` longer than this per message; split or truncate to avoid errors. */
export const DISCORD_MAX_MESSAGE_LENGTH = 2000;

export function truncateForDiscord(text: string, max = DISCORD_MAX_MESSAGE_LENGTH): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 24)}\n…(truncated)`;
}

export function splitDiscordChunks(text: string, maxLen = DISCORD_MAX_MESSAGE_LENGTH): string[] {
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    if (rest.length <= maxLen) {
      chunks.push(rest);
      break;
    }
    const slice = rest.slice(0, maxLen);
    let cut = maxLen;
    const doubleNl = slice.lastIndexOf('\n\n');
    if (doubleNl > maxLen * 0.25) {
      cut = doubleNl + 2;
    } else {
      const singleNl = slice.lastIndexOf('\n');
      if (singleNl > maxLen * 0.3) {
        cut = singleNl + 1;
      } else {
        const space = slice.lastIndexOf(' ');
        if (space > maxLen * 0.45) {
          cut = space + 1;
        }
      }
    }
    const part = rest.slice(0, cut).trimEnd();
    if (part.length === 0) {
      chunks.push(rest.slice(0, maxLen));
      rest = rest.slice(maxLen);
      continue;
    }
    chunks.push(part);
    rest = rest.slice(cut).trimStart();
  }
  return chunks;
}
