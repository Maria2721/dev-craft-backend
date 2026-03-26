import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HttpException } from '@nestjs/common';
import * as z from 'zod/v4';

import {
  MCP_ERROR_PREFIX,
  MCP_SERVER_DEFAULT_VERSION,
  MCP_SERVER_NAME,
  MCP_TEXT_CONTENT_TYPE,
  TOPIC_SUMMARY_INCLUDE_SAMPLES_DESCRIPTION,
  TOPIC_SUMMARY_TOOL_DESCRIPTION,
  TOPIC_SUMMARY_TOOL_NAME,
  TOPIC_SUMMARY_TOOL_TITLE,
  TOPIC_SUMMARY_TOPIC_ID_DESCRIPTION,
  TOPIC_SUMMARY_TOPIC_SLUG_DESCRIPTION,
} from './mcp.constants';

export type DevCraftMcpServerOptions = {
  getTopicSummary?: (input: {
    topicId?: string;
    topicSlug?: string;
    includeSamples?: boolean;
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

  if (options.getTopicSummary) {
    const getSummary = options.getTopicSummary;
    server.registerTool(
      TOPIC_SUMMARY_TOOL_NAME,
      {
        title: TOPIC_SUMMARY_TOOL_TITLE,
        description: TOPIC_SUMMARY_TOOL_DESCRIPTION,
        inputSchema: {
          topicId: z.string().optional().describe(TOPIC_SUMMARY_TOPIC_ID_DESCRIPTION),
          topicSlug: z.string().optional().describe(TOPIC_SUMMARY_TOPIC_SLUG_DESCRIPTION),
          includeSamples: z
            .boolean()
            .optional()
            .describe(TOPIC_SUMMARY_INCLUDE_SAMPLES_DESCRIPTION),
        },
      },
      async (args) => {
        try {
          const result = await getSummary(args);
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
