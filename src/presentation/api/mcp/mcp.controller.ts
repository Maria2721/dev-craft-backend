import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { All, Controller, Logger, Req, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';
import type { UserPracticeStatsResult } from '../../../application/knowledge/get-platform-stats.use-case';
import { GetPlatformStatsUseCase } from '../../../application/knowledge/get-platform-stats.use-case';
import { GetTopicCodeTasksUseCase } from '../../../application/knowledge/get-topic-code-tasks.use-case';
import { SubmitCodeTaskAiCheckUseCase } from '../../../application/knowledge/submit-code-task-ai-check.use-case';
import type { TopicCodeTasks } from '../../../domain/repositories/topic.repository';
import { DiscordPracticeUserService } from '../../../infrastructure/discord/discord-practice-user.service';
import { createDevCraftMcpServer } from '../../../infrastructure/mcp/create-devcraft-mcp-server';
@Controller('mcp')
@SkipThrottle()
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(
    private readonly getKnowledgeTopicsUseCase: GetKnowledgeTopicsUseCase,
    private readonly getPlatformStatsUseCase: GetPlatformStatsUseCase,
    private readonly getTopicCodeTasksUseCase: GetTopicCodeTasksUseCase,
    private readonly submitCodeTaskAiCheckUseCase: SubmitCodeTaskAiCheckUseCase,
    private readonly discordPracticeUserService: DiscordPracticeUserService,
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

  private formatUserPracticeStatsText(s: UserPracticeStatsResult): string {
    const pct = (num: number, den: number): string =>
      den === 0 ? 'n/a' : `${((100 * num) / den).toFixed(1)}%`;

    const scope =
      s.resolvedTopic != null
        ? `Тема: ${s.resolvedTopic.title} (slug: ${s.resolvedTopic.slug})`
        : 'Все темы';

    const lines = [
      'Статистика практики DevCraft (только задания с AI-проверкой кода).',
      `Область: ${scope}`,
      '',
      `За всё время — попыток: ${s.codeTaskAttemptsTotal}, успешных (valid): ${s.codeTaskAttemptsValid}, доля успеха: ${pct(s.codeTaskAttemptsValid, s.codeTaskAttemptsTotal)}`,
      `Последние 7 дней — попыток: ${s.codeTaskAttemptsLast7Days}, успешных: ${s.codeTaskAttemptsValidLast7Days}, доля успеха: ${pct(s.codeTaskAttemptsValidLast7Days, s.codeTaskAttemptsLast7Days)}`,
    ];

    return lines.join('\n');
  }

  private formatTopicCodeTasksText(data: TopicCodeTasks): string {
    const lines = [
      `Topic: ${data.topic.title}`,
      `Slug: ${data.topic.slug}`,
      `Topic ID: ${data.topic.id}`,
      `Code tasks (${data.codeTasks.length}):`,
    ];
    let i = 1;
    for (const task of data.codeTasks) {
      lines.push('');
      lines.push(`${i}. [${task.taskType}] ${task.title}`);
      lines.push(`   Task ID: ${task.id}`);
      lines.push(`   Order: ${task.order}`);
      lines.push(`   Description:\n${task.description}`);
      i += 1;
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
      getPlatformStats: async ({ discordUserId, topicId, topicSlug }) => {
        const userId = await this.discordPracticeUserService.resolveUserId(discordUserId);
        const stats = await this.getPlatformStatsUseCase.execute({
          userId,
          topicId,
          topicSlug,
        });
        let text = this.formatUserPracticeStatsText(stats);
        const filter =
          (topicId != null && topicId.trim() !== '') ||
          (topicSlug != null && topicSlug.trim() !== '');
        if (filter && stats.resolvedTopic == null) {
          text +=
            '\n\nNote: topicId/topicSlug did not match any topic; stats are for all topics for this user.';
        }
        return text;
      },
      getTopicCodeTasks: async ({ topicId, topicSlug }) => {
        const topics = await this.getKnowledgeTopicsUseCase.execute();
        const resolvedTopic =
          topicId != null
            ? topics.find((topic) => topic.id === topicId)
            : topicSlug != null
              ? topics.find((topic) => topic.slug === topicSlug)
              : null;

        if (!resolvedTopic) {
          const catalog = this.formatTopicsList(topics);
          return `Specify topicId or topicSlug to list code tasks.\n\n${catalog}`;
        }

        const data = await this.getTopicCodeTasksUseCase.execute(resolvedTopic.id);
        return this.formatTopicCodeTasksText(data);
      },
      submitCodeTaskAiCheck: async ({ discordUserId, topicId, codeTaskId, code }) => {
        const userId = await this.discordPracticeUserService.resolveUserId(discordUserId);
        const out = await this.submitCodeTaskAiCheckUseCase.execute({
          userId,
          topicId,
          codeTaskId,
          code,
        });
        return JSON.stringify(
          {
            valid: out.valid,
            attemptId: out.attemptId,
            codeTaskId: out.codeTaskId,
            hints: out.hints,
            justification: out.justification,
            improvements: out.improvements,
          },
          null,
          2,
        );
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
