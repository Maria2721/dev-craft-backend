/**
 * Unit tests for KnowledgeController (GET handlers)
 */

import { Test } from '@nestjs/testing';

import { GetKnowledgeTopicsUseCase } from '../../../../../src/application/knowledge/get-knowledge-topics.use-case';
import { GetTopicCodeTasksUseCase } from '../../../../../src/application/knowledge/get-topic-code-tasks.use-case';
import { GetTopicPreviewUseCase } from '../../../../../src/application/knowledge/get-topic-preview.use-case';
import { GetTopicQuestionsUseCase } from '../../../../../src/application/knowledge/get-topic-questions.use-case';
import { SubmitCodeTaskAiCheckUseCase } from '../../../../../src/application/knowledge/submit-code-task-ai-check.use-case';
import { SubmitCodeTaskDragDropUseCase } from '../../../../../src/application/knowledge/submit-code-task-drag-drop.use-case';
import { SubmitTopicQuestionAttemptsUseCase } from '../../../../../src/application/knowledge/submit-topic-question-attempts.use-case';
import { KnowledgeController } from '../../../../../src/presentation/api/knowledge/knowledge.controller';

describe('KnowledgeController', () => {
  async function setupController() {
    const topics = { execute: jest.fn().mockResolvedValue([]) };
    const preview = { execute: jest.fn().mockResolvedValue({}) };
    const questions = { execute: jest.fn().mockResolvedValue({}) };
    const codeTasks = { execute: jest.fn().mockResolvedValue({}) };
    const submitQ = { execute: jest.fn() };
    const submitAi = { execute: jest.fn() };
    const submitDd = { execute: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [KnowledgeController],
      providers: [
        { provide: GetKnowledgeTopicsUseCase, useValue: topics },
        { provide: GetTopicPreviewUseCase, useValue: preview },
        { provide: GetTopicQuestionsUseCase, useValue: questions },
        { provide: GetTopicCodeTasksUseCase, useValue: codeTasks },
        { provide: SubmitTopicQuestionAttemptsUseCase, useValue: submitQ },
        { provide: SubmitCodeTaskAiCheckUseCase, useValue: submitAi },
        { provide: SubmitCodeTaskDragDropUseCase, useValue: submitDd },
      ],
    }).compile();

    return {
      controller: moduleRef.get(KnowledgeController),
      topics,
      preview,
      questions,
      codeTasks,
    };
  }

  it('listTopics calls use case', async () => {
    const { controller, topics } = await setupController();
    await controller.listTopics();
    expect(topics.execute).toHaveBeenCalledWith();
  });

  it('getTopicPreview passes topicId', async () => {
    const { controller, preview } = await setupController();
    await controller.getTopicPreview('tid');
    expect(preview.execute).toHaveBeenCalledWith('tid');
  });

  it('getTopicQuestions passes topicId', async () => {
    const { controller, questions } = await setupController();
    await controller.getTopicQuestions('tid');
    expect(questions.execute).toHaveBeenCalledWith('tid');
  });

  it('getTopicCodeTasks passes topicId', async () => {
    const { controller, codeTasks } = await setupController();
    await controller.getTopicCodeTasks('tid');
    expect(codeTasks.execute).toHaveBeenCalledWith('tid');
  });
});
