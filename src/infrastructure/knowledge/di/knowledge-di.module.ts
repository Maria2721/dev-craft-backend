import { Module } from '@nestjs/common';

import { GetKnowledgeTopicsUseCase } from '../../../application/knowledge/get-knowledge-topics.use-case';
import { GetTopicCodeTasksUseCase } from '../../../application/knowledge/get-topic-code-tasks.use-case';
import { GetTopicPreviewUseCase } from '../../../application/knowledge/get-topic-preview.use-case';
import { GetTopicQuestionsUseCase } from '../../../application/knowledge/get-topic-questions.use-case';
import { SubmitCodeTaskAiCheckUseCase } from '../../../application/knowledge/submit-code-task-ai-check.use-case';
import { SubmitTopicQuestionAttemptsUseCase } from '../../../application/knowledge/submit-topic-question-attempts.use-case';
import { CodeTaskRepository } from '../../../domain/repositories/code-task.repository';
import { CodeTaskAttemptRepository } from '../../../domain/repositories/code-task-attempt.repository';
import { QuestionRepository } from '../../../domain/repositories/question.repository';
import { QuestionAttemptRepository } from '../../../domain/repositories/question-attempt.repository';
import { TopicRepository } from '../../../domain/repositories/topic.repository';
import { AiDiModule } from '../../ai/di/ai-di.module';
import { PrismaCodeTaskRepository } from '../../persistence/code-task/prisma-code-task.repository';
import { PrismaCodeTaskAttemptRepository } from '../../persistence/code-task-attempt/prisma-code-task-attempt.repository';
import { PrismaModule } from '../../persistence/prisma/prisma.module';
import { PrismaQuestionRepository } from '../../persistence/question/prisma-question.repository';
import { PrismaQuestionAttemptRepository } from '../../persistence/question-attempt/prisma-question-attempt.repository';
import { PrismaTopicRepository } from '../../persistence/topic/prisma-topic.repository';

@Module({
  imports: [PrismaModule, AiDiModule],
  providers: [
    { provide: TopicRepository, useClass: PrismaTopicRepository },
    { provide: QuestionRepository, useClass: PrismaQuestionRepository },
    { provide: QuestionAttemptRepository, useClass: PrismaQuestionAttemptRepository },
    { provide: CodeTaskRepository, useClass: PrismaCodeTaskRepository },
    { provide: CodeTaskAttemptRepository, useClass: PrismaCodeTaskAttemptRepository },
    GetKnowledgeTopicsUseCase,
    GetTopicCodeTasksUseCase,
    GetTopicPreviewUseCase,
    GetTopicQuestionsUseCase,
    SubmitTopicQuestionAttemptsUseCase,
    SubmitCodeTaskAiCheckUseCase,
  ],
  exports: [
    GetKnowledgeTopicsUseCase,
    GetTopicCodeTasksUseCase,
    GetTopicPreviewUseCase,
    GetTopicQuestionsUseCase,
    SubmitTopicQuestionAttemptsUseCase,
    SubmitCodeTaskAiCheckUseCase,
  ],
})
export class KnowledgeDiModule {}
