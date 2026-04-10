export const MCP_SERVER_NAME = 'dev-craft-backend';
export const MCP_SERVER_DEFAULT_VERSION = '0.0.1';

export const KNOWLEDGE_TOPIC_ID_DESCRIPTION = 'Optional topic identifier (topics.id UUID).';
export const KNOWLEDGE_TOPIC_SLUG_DESCRIPTION = 'Optional topic slug (topics.slug).';

export const GET_PLATFORM_STATS_TOOL_NAME = 'get_platform_stats';
export const GET_PLATFORM_STATS_TOOL_TITLE = 'Get user practice stats';
export const GET_PLATFORM_STATS_TOOL_DESCRIPTION =
  'Returns practice statistics for a single user (resolved via Discord snowflake like submit_code_task_ai_check): code-task AI_CHECK attempts only (totals, valid rate, last 7 days). Question-quiz stats are not included. Optionally restrict to one topic with topicId or topicSlug. No other users or global aggregates.';
export const GET_PLATFORM_STATS_DISCORD_USER_ID_DESCRIPTION =
  'Discord user snowflake (numeric string). Same attribution as submit_code_task_ai_check (shadow or shared user mode).';
export const GET_PLATFORM_STATS_TOPIC_ID_DESCRIPTION = 'Optional: limit stats to this topic UUID.';
export const GET_PLATFORM_STATS_TOPIC_SLUG_DESCRIPTION =
  'Optional: limit stats to this topic slug.';

export const TOPIC_CODE_TASKS_TOOL_NAME = 'get_topic_code_tasks';
export const TOPIC_CODE_TASKS_TOOL_TITLE = 'Get topic code tasks';
export const TOPIC_CODE_TASKS_TOOL_DESCRIPTION =
  'Returns code practice tasks for a DevCraft topic from the database (id, title, description, task type, order). Does not expose reference solutions. Pass topicId or topicSlug; if both omitted, returns the topic catalog.';
export const TOPIC_CODE_TASKS_TOPIC_ID_DESCRIPTION = KNOWLEDGE_TOPIC_ID_DESCRIPTION;
export const TOPIC_CODE_TASKS_TOPIC_SLUG_DESCRIPTION = KNOWLEDGE_TOPIC_SLUG_DESCRIPTION;

export const SUBMIT_CODE_TASK_AI_CHECK_TOOL_NAME = 'submit_code_task_ai_check';
export const SUBMIT_CODE_TASK_AI_CHECK_TOOL_TITLE = 'Submit code task AI check';
export const SUBMIT_CODE_TASK_AI_CHECK_TOOL_DESCRIPTION =
  'Runs the same DevCraft AI_CHECK pipeline as the web app: compares user code to the reference, returns valid/hints/justification, and persists a code_task_attempt. Use with discordUserId (snowflake), topicId, codeTaskId (UUIDs), and code.';
export const SUBMIT_CODE_TASK_DISCORD_USER_ID_DESCRIPTION =
  'Discord user snowflake (numeric string). Used to attribute the attempt (shadow User per id, or shared mode via env).';
export const SUBMIT_CODE_TASK_TOPIC_ID_PARAM_DESCRIPTION = 'Topic UUID (topics.id).';
export const SUBMIT_CODE_TASK_CODE_TASK_ID_DESCRIPTION = 'Code task UUID (code_tasks.id).';
export const SUBMIT_CODE_TASK_CODE_BODY_DESCRIPTION =
  "User's submitted source code for the AI_CHECK task.";

export const MCP_TEXT_CONTENT_TYPE = 'text';
export const MCP_ERROR_PREFIX = 'Error:';
