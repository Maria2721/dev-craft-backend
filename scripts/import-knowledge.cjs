/* eslint-disable no-console */
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractSections(markdown) {
  const topicRegex = /^##\s+\d+\.\s+(.+)$/gm;
  const headers = Array.from(markdown.matchAll(topicRegex));

  return headers.map((match, index) => {
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = index + 1 < headers.length ? headers[index + 1].index : markdown.length;
    return { title, content: markdown.slice(start, end).trim() };
  });
}

function splitNumberedItems(block) {
  const starts = Array.from(block.matchAll(/^\d+\.\s+/gm));
  return starts.map((match, index) => {
    const start = match.index;
    const end = index + 1 < starts.length ? starts[index + 1].index : block.length;
    return block.slice(start, end).replace(/^\d+\.\s+/, '').trim();
  });
}

function parseQuestions(sectionContent) {
  const questionsHeader = '### Questions';
  const codeTasksHeader = '### Code Tasks';
  const start = sectionContent.indexOf(questionsHeader);
  const end = sectionContent.indexOf(codeTasksHeader);
  if (start === -1 || end === -1 || end <= start) return [];

  const block = sectionContent.slice(start + questionsHeader.length, end).trim();
  const chunks = splitNumberedItems(block);

  return chunks.map((chunk, index) => {
    const correctMatch = chunk.match(/Correct answer:\s+\*\*([^*]+)\*\*/i);
    if (!correctMatch) {
      throw new Error(`Question #${index + 1}: missing "Correct answer"`);
    }

    const optionRegex = /^([A-Z])\.\s+(.+)$/gm;
    const options = Array.from(chunk.matchAll(optionRegex)).map((m, optionIndex) => ({
      label: m[1],
      text: m[2].trim(),
      order: optionIndex + 1,
    }));
    if (options.length === 0) {
      throw new Error(`Question #${index + 1}: missing options`);
    }

    const promptPart = chunk.split(/\nCorrect answer:/i)[0].trim();
    const codeMatch = promptPart.match(/```[\w]*\n([\s\S]*?)```/);
    const prompt = promptPart.replace(/```[\w]*\n[\s\S]*?```/g, '').trim();
    const correctLabels = correctMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const optionsWithCorrect = options.map((option) => ({
      ...option,
      isCorrect: correctLabels.includes(option.label),
    }));

    return {
      prompt,
      codeSnippet: codeMatch ? codeMatch[1].trim() : null,
      type: correctLabels.length > 1 ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE',
      order: index + 1,
      options: optionsWithCorrect,
    };
  });
}

function parseCodeTasks(sectionContent) {
  const codeTasksHeader = '### Code Tasks';
  const start = sectionContent.indexOf(codeTasksHeader);
  if (start === -1) return [];

  const block = sectionContent.slice(start + codeTasksHeader.length).trim();
  const chunks = splitNumberedItems(block);

  return chunks.map((chunk, index) => {
    const firstLineEnd = chunk.indexOf('\n');
    const heading = (firstLineEnd === -1 ? chunk : chunk.slice(0, firstLineEnd)).trim();
    const match = heading.match(/^(.+?)\s+-\s+(AI_CHECK|DRAG_DROP)$/);
    if (!match) {
      throw new Error(`Code task #${index + 1}: expected "Title - AI_CHECK|DRAG_DROP"`);
    }
    const title = match[1].trim();
    const taskType = match[2];
    const content = (firstLineEnd === -1 ? '' : chunk.slice(firstLineEnd + 1)).trim();
    const [descriptionPart] = content.split(/\*\*Solution\*\*/i);
    const solutionMatch = content.match(/```[\w]*\n([\s\S]*?)```/);

    return {
      title,
      description: (descriptionPart || '').trim(),
      taskType,
      referenceSolution: solutionMatch ? solutionMatch[1].trim() : null,
      order: index + 1,
    };
  });
}

async function main() {
  const filePath = resolve(process.cwd(), 'seed', 'knowledge', 'knowledge_list_new.md');
  const markdown = readFileSync(filePath, 'utf8');
  const sections = extractSections(markdown);

  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.codeTask.deleteMany();
  await prisma.topic.deleteMany();

  for (let topicIndex = 0; topicIndex < sections.length; topicIndex++) {
    const section = sections[topicIndex];
    const questions = parseQuestions(section.content);
    const codeTasks = parseCodeTasks(section.content);

    await prisma.topic.create({
      data: {
        slug: toSlug(section.title),
        title: section.title,
        description: `${section.title} learning topic`,
        order: topicIndex + 1,
        questions: {
          create: questions.map((question) => ({
            prompt: question.prompt,
            codeSnippet: question.codeSnippet,
            type: question.type,
            order: question.order,
            options: {
              create: question.options,
            },
          })),
        },
        codeTasks: {
          create: codeTasks.map((task) => ({
            title: task.title,
            description: task.description,
            taskType: task.taskType,
            referenceSolution: task.referenceSolution,
            order: task.order,
          })),
        },
      },
    });
  }

  console.log(`Imported ${sections.length} topics from knowledge_list_new.md`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

