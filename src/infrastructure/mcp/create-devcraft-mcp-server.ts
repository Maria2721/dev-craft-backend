import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HttpException } from '@nestjs/common';
import * as z from 'zod/v4';

import {
  GET_PLATFORM_STATS_DISCORD_USER_ID_DESCRIPTION,
  GET_PLATFORM_STATS_TOOL_DESCRIPTION,
  GET_PLATFORM_STATS_TOOL_NAME,
  GET_PLATFORM_STATS_TOOL_TITLE,
  GET_PLATFORM_STATS_TOPIC_ID_DESCRIPTION,
  GET_PLATFORM_STATS_TOPIC_SLUG_DESCRIPTION,
  MCP_ERROR_PREFIX,
  MCP_SERVER_DEFAULT_VERSION,
  MCP_SERVER_NAME,
  MCP_TEXT_CONTENT_TYPE,
  SUBMIT_CODE_TASK_AI_CHECK_TOOL_DESCRIPTION,
  SUBMIT_CODE_TASK_AI_CHECK_TOOL_NAME,
  SUBMIT_CODE_TASK_AI_CHECK_TOOL_TITLE,
  SUBMIT_CODE_TASK_CODE_BODY_DESCRIPTION,
  SUBMIT_CODE_TASK_CODE_TASK_ID_DESCRIPTION,
  SUBMIT_CODE_TASK_DISCORD_USER_ID_DESCRIPTION,
  SUBMIT_CODE_TASK_TOPIC_ID_PARAM_DESCRIPTION,
  TOPIC_CODE_TASKS_TOOL_DESCRIPTION,
  TOPIC_CODE_TASKS_TOOL_NAME,
  TOPIC_CODE_TASKS_TOOL_TITLE,
  TOPIC_CODE_TASKS_TOPIC_ID_DESCRIPTION,
  TOPIC_CODE_TASKS_TOPIC_SLUG_DESCRIPTION,
} from './mcp.constants';

const DEFAULT_MAX_CODE = 4000;
const MCP_CODE_MAX_LENGTH = Number(process.env.AI_MAX_MESSAGE_LENGTH) || DEFAULT_MAX_CODE;

export type DevCraftMcpServerOptions = {
  getPlatformStats?: (input: {
    discordUserId: string;
    topicId?: string;
    topicSlug?: string;
  }) => Promise<string>;
  getTopicCodeTasks?: (input: { topicId?: string; topicSlug?: string }) => Promise<string>;
  submitCodeTaskAiCheck?: (input: {
    discordUserId: string;
    topicId: string;
    codeTaskId: string;
    code: string;
  }) => Promise<string>;
};

export function createDevCraftMcpServer(options: DevCraftMcpServerOptions = {}): McpServer {
  const server = new McpServer(
    {
      name: MCP_SERVER_NAME,
      version: process.env.npm_package_version ?? MCP_SERVER_DEFAULT_VERSION,
    },
    { capabilities: {} },
  );

  if (options.getPlatformStats) {
    const getStats = options.getPlatformStats;
    server.registerTool(
      GET_PLATFORM_STATS_TOOL_NAME,
      {
        title: GET_PLATFORM_STATS_TOOL_TITLE,
        description: GET_PLATFORM_STATS_TOOL_DESCRIPTION,
        inputSchema: {
          discordUserId: z.string().min(1).describe(GET_PLATFORM_STATS_DISCORD_USER_ID_DESCRIPTION),
          topicId: z.string().optional().describe(GET_PLATFORM_STATS_TOPIC_ID_DESCRIPTION),
          topicSlug: z.string().optional().describe(GET_PLATFORM_STATS_TOPIC_SLUG_DESCRIPTION),
        },
      },
      async (args) => {
        try {
          const result = await getStats(args);
          return {
            content: [
              {
                type: MCP_TEXT_CONTENT_TYPE,
                text: result,
              },
            ],
          };
        } catch (err: unknown) {
          const message =
            err instanceof HttpException
              ? err.message
              : err instanceof Error
                ? err.message
                : String(err);
          return {
            content: [
              {
                type: MCP_TEXT_CONTENT_TYPE,
                text: `${MCP_ERROR_PREFIX} ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  if (options.getTopicCodeTasks) {
    const getTasks = options.getTopicCodeTasks;
    server.registerTool(
      TOPIC_CODE_TASKS_TOOL_NAME,
      {
        title: TOPIC_CODE_TASKS_TOOL_TITLE,
        description: TOPIC_CODE_TASKS_TOOL_DESCRIPTION,
        inputSchema: {
          topicId: z.string().optional().describe(TOPIC_CODE_TASKS_TOPIC_ID_DESCRIPTION),
          topicSlug: z.string().optional().describe(TOPIC_CODE_TASKS_TOPIC_SLUG_DESCRIPTION),
        },
      },
      async (args) => {
        try {
          const result = await getTasks(args);
          return {
            content: [
              {
                type: MCP_TEXT_CONTENT_TYPE,
                text: result,
              },
            ],
          };
        } catch (err: unknown) {
          const message =
            err instanceof HttpException
              ? err.message
              : err instanceof Error
                ? err.message
                : String(err);
          return {
            content: [
              {
                type: MCP_TEXT_CONTENT_TYPE,
                text: `${MCP_ERROR_PREFIX} ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  if (options.submitCodeTaskAiCheck) {
    const submit = options.submitCodeTaskAiCheck;
    server.registerTool(
      SUBMIT_CODE_TASK_AI_CHECK_TOOL_NAME,
      {
        title: SUBMIT_CODE_TASK_AI_CHECK_TOOL_TITLE,
        description: SUBMIT_CODE_TASK_AI_CHECK_TOOL_DESCRIPTION,
        inputSchema: {
          discordUserId: z.string().describe(SUBMIT_CODE_TASK_DISCORD_USER_ID_DESCRIPTION),
          topicId: z.string().describe(SUBMIT_CODE_TASK_TOPIC_ID_PARAM_DESCRIPTION),
          codeTaskId: z.string().describe(SUBMIT_CODE_TASK_CODE_TASK_ID_DESCRIPTION),
          code: z
            .string()
            .min(1)
            .max(MCP_CODE_MAX_LENGTH)
            .describe(SUBMIT_CODE_TASK_CODE_BODY_DESCRIPTION),
        },
      },
      async (args) => {
        try {
          const result = await submit(args);
          return {
            content: [
              {
                type: MCP_TEXT_CONTENT_TYPE,
                text: result,
              },
            ],
          };
        } catch (err: unknown) {
          const message =
            err instanceof HttpException
              ? err.message
              : err instanceof Error
                ? err.message
                : String(err);
          return {
            content: [
              {
                type: MCP_TEXT_CONTENT_TYPE,
                text: `${MCP_ERROR_PREFIX} ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  return server;
}
