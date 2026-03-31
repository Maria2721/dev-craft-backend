import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';
import { GetTopicCodeTasksUseCase } from '../../../application/knowledge/get-topic-code-tasks.use-case';
import { GetTopicPreviewUseCase } from '../../../application/knowledge/get-topic-preview.use-case';
import { GetTopicQuestionsUseCase } from '../../../application/knowledge/get-topic-questions.use-case';
import { SubmitCodeTaskAiCheckUseCase } from '../../../application/knowledge/submit-code-task-ai-check.use-case';
import { SubmitTopicQuestionAttemptsUseCase } from '../../../application/knowledge/submit-topic-question-attempts.use-case';
import { User } from '../../decorators/user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PostCodeTaskAiCheckDto } from './dto/post-code-task-ai-check.dto';
import { PostTopicQuestionAttemptsDto } from './dto/post-topic-question-attempts.dto';

@Controller('knowledge/topics')
export class KnowledgeController {
  constructor(
    private readonly getKnowledgeTopicsUseCase: GetKnowledgeTopicsUseCase,
    private readonly getTopicCodeTasksUseCase: GetTopicCodeTasksUseCase,
    private readonly getTopicPreviewUseCase: GetTopicPreviewUseCase,
    private readonly getTopicQuestionsUseCase: GetTopicQuestionsUseCase,
    private readonly submitTopicQuestionAttemptsUseCase: SubmitTopicQuestionAttemptsUseCase,
    private readonly submitCodeTaskAiCheckUseCase: SubmitCodeTaskAiCheckUseCase,
  ) {}

  @Get()
  async listTopics() {
    return this.getKnowledgeTopicsUseCase.execute();
  }

  @Get(':topicId/preview')
  async getTopicPreview(@Param('topicId') topicId: string) {
    return this.getTopicPreviewUseCase.execute(topicId);
  }

  @Get(':topicId/questions')
  async getTopicQuestions(@Param('topicId') topicId: string) {
    return this.getTopicQuestionsUseCase.execute(topicId);
  }

  @Get(':topicId/code-tasks')
  async getTopicCodeTasks(@Param('topicId') topicId: string) {
    return this.getTopicCodeTasksUseCase.execute(topicId);
  }

  @Post(':topicId/code-tasks/:codeTaskId/ai-check')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 3_600_000, limit: 50 } })
  async submitCodeTaskAiCheck(
    @Param('topicId') topicId: string,
    @Param('codeTaskId') codeTaskId: string,
    @User('userId') userId: number,
    @Body() dto: PostCodeTaskAiCheckDto,
  ) {
    return this.submitCodeTaskAiCheckUseCase.execute({
      userId,
      topicId,
      codeTaskId,
      code: dto.code,
    });
  }

  @Post(':topicId/questions/attempts')
  @UseGuards(JwtAuthGuard)
  async submitTopicQuestionAttempts(
    @Param('topicId') topicId: string,
    @User('userId') userId: number,
    @Body() dto: PostTopicQuestionAttemptsDto,
  ) {
    return this.submitTopicQuestionAttemptsUseCase.execute({
      userId,
      topicId,
      attempts: dto.attempts,
    });
  }
}
