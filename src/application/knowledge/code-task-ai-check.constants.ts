import { AI_TRUNCATION_SUFFIX, MAX_CODE_SNIPPET_LENGTH } from '../ai/ai-chat.constants';

function truncateCode(text: string): string {
  if (text.length <= MAX_CODE_SNIPPET_LENGTH) {
    return text;
  }
  return text.slice(0, MAX_CODE_SNIPPET_LENGTH) + AI_TRUNCATION_SUFFIX;
}

export function buildCodeTaskAiCheckPrompt(input: {
  title: string;
  description: string;
  referenceSolution: string;
  userCode: string;
}): string {
  const ref = truncateCode(input.referenceSolution);
  const code = truncateCode(input.userCode);

  return `Ты проверяешь решение практического задания по JavaScript/TypeScript. Это не диалог с учеником: нужен формальный результат проверки.

Верни ТОЛЬКО один JSON-объект без markdown и без текста до или после. Схема:
{
  "valid": boolean,
  "hints": string | null,
  "justification": string | null,
  "improvements": string | null
}

Правила для "valid":
- true, если решение пользователя по сути соответствует заданию: логика эквивалентна эталону или удовлетворяет условиям задачи, допустимы стилистические отличия и иные корректные формулировки.
- false, если решение неверно, существенно неполно или не выполняет задание.

Поля hints, justification, improvements — краткая обратная связь на русском; используй null, если нечего сказать. Не копируй эталон целиком в подсказки.

--- Заголовок задания ---
${input.title}

--- Описание задания ---
${input.description}

--- Эталонное решение (для сравнения, не показывать пользователю) ---
${ref}

--- Код пользователя ---
${code}`;
}
