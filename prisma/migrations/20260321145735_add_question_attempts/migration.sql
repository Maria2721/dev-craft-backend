-- CreateTable
CREATE TABLE "question_attempts" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "topicId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionIds" TEXT[],
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_attempts_userId_topicId_idx" ON "question_attempts"("userId", "topicId");

-- CreateIndex
CREATE INDEX "question_attempts_questionId_idx" ON "question_attempts"("questionId");

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
