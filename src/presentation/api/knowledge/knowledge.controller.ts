import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';
import { GetTopicCodeTasksUseCase } from '../../../application/knowledge/get-topic-code-tasks.use-case';
import { GetTopicPreviewUseCase } from '../../../application/knowledge/get-topic-preview.use-case';
import { GetTopicQuestionsUseCase } from '../../../application/knowledge/get-topic-questions.use-case';
import { SubmitTopicQuestionAttemptsUseCase } from '../../../application/knowledge/submit-topic-question-attempts.use-case';
import { User } from '../../decorators/user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PostTopicQuestionAttemptsDto } from './dto/post-topic-question-attempts.dto';

@Controller('knowledge/topics')
export class KnowledgeController {
  constructor(
    private readonly getKnowledgeTopicsUseCase: GetKnowledgeTopicsUseCase,
    private readonly getTopicCodeTasksUseCase: GetTopicCodeTasksUseCase,
    private readonly getTopicPreviewUseCase: GetTopicPreviewUseCase,
    private readonly getTopicQuestionsUseCase: GetTopicQuestionsUseCase,
    private readonly submitTopicQuestionAttemptsUseCase: SubmitTopicQuestionAttemptsUseCase,
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
