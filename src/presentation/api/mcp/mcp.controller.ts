import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { All, Controller, Logger, Req, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';
import { GetTopicPreviewUseCase } from '../../../application/knowledge/get-topic-preview.use-case';
import { createDevCraftMcpServer } from '../../../infrastructure/mcp/create-devcraft-mcp-server';
@Controller('mcp')
@SkipThrottle()
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(
    private readonly getKnowledgeTopicsUseCase: GetKnowledgeTopicsUseCase,
    private readonly getTopicPreviewUseCase: GetTopicPreviewUseCase,
  ) {}

  private formatTopicsList(
    topics: Awaited<ReturnType<GetKnowledgeTopicsUseCase['execute']>>,
  ): string {
    if (!topics.length) {
      return 'No topics found.';
    }

    const lines = ['Available topics:'];
    for (const topic of topics) {
      lines.push(
        `- ${topic.title} (slug: ${topic.slug}, id: ${topic.id}, questions: ${topic.questionsCount}, code tasks: ${topic.codeTasksCount})`,
      );
    }
    return lines.join('\n');
  }

  private formatTopicSummary(input: {
    preview: Awaited<ReturnType<GetTopicPreviewUseCase['execute']>>;
    includeSamples: boolean;
  }): string {
    const { preview, includeSamples } = input;
    const lines = [
      `Topic: ${preview.topic.title}`,
      `Slug: ${preview.topic.slug}`,
      `Topic ID: ${preview.topic.id}`,
      `Description: ${preview.topic.description ?? 'No description'}`,
      `Questions count: ${preview.questions.length}`,
      `Code tasks count: ${preview.codeTasks.length}`,
    ];

    if (includeSamples) {
      if (preview.questions.length) {
        lines.push('Sample question prompts:');
        for (const question of preview.questions.slice(0, 3)) {
          lines.push(`- ${question.prompt}`);
        }
      }
      if (preview.codeTasks.length) {
        lines.push('Sample code-task titles:');
        for (const task of preview.codeTasks.slice(0, 3)) {
          lines.push(`- ${task.title}`);
        }
      }
    }

    return lines.join('\n');
  }

  @All()
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    const expected = process.env.MCP_BEARER_TOKEN;
    if (expected) {
      const auth = req.headers.authorization;
      if (auth !== `Bearer ${expected}`) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
    }

    const mcpServer = createDevCraftMcpServer({
      getTopicSummary: async ({ topicId, topicSlug, includeSamples }) => {
        const topics = await this.getKnowledgeTopicsUseCase.execute();
        const resolvedTopic =
          topicId != null
            ? topics.find((topic) => topic.id === topicId)
            : topicSlug != null
              ? topics.find((topic) => topic.slug === topicSlug)
              : null;

        if (!resolvedTopic) {
          return this.formatTopicsList(topics);
        }

        const preview = await this.getTopicPreviewUseCase.execute(resolvedTopic.id);
        return this.formatTopicSummary({
          preview,
          includeSamples: includeSamples === true,
        });
      },
    });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    try {
      await mcpServer.connect(transport);
      const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body;
      await transport.handleRequest(req, res, body);
      res.on('close', () => {
        void transport.close();
        void mcpServer.close();
      });
    } catch (err) {
      this.logger.error('MCP request failed', err instanceof Error ? err.stack : err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal error' },
          id: null,
        });
      }
    }
  }
}
