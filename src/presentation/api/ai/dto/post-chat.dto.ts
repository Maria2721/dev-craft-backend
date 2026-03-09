import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const DEFAULT_MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGE_LENGTH = Number(process.env.AI_MAX_MESSAGE_LENGTH) || DEFAULT_MAX_MESSAGE_LENGTH;

export class PostChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_MESSAGE_LENGTH, {
    message: `message must not exceed ${MAX_MESSAGE_LENGTH} characters`,
  })
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  context?: {
    taskId?: string;
    taskType?: string;
    taskTitle?: string;
    taskDescription?: string;
    codeSnippet?: string;
  };
}
