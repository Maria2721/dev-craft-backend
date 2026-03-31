-- CreateTable
CREATE TABLE "code_task_attempts" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "topicId" TEXT NOT NULL,
    "codeTaskId" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL,
    "hints" TEXT,
    "justification" TEXT,
    "improvements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_task_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "code_task_attempts_userId_topicId_idx" ON "code_task_attempts"("userId", "topicId");

-- CreateIndex
CREATE INDEX "code_task_attempts_codeTaskId_idx" ON "code_task_attempts"("codeTaskId");

-- AddForeignKey
ALTER TABLE "code_task_attempts" ADD CONSTRAINT "code_task_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_task_attempts" ADD CONSTRAINT "code_task_attempts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_task_attempts" ADD CONSTRAINT "code_task_attempts_codeTaskId_fkey" FOREIGN KEY ("codeTaskId") REFERENCES "code_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
