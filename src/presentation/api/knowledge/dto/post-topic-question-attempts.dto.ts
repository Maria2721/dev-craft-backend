import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';

export class TopicQuestionAttemptDto {
  @IsUUID()
  questionId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  selectedOptionIds!: string[];
}

export class PostTopicQuestionAttemptsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TopicQuestionAttemptDto)
  attempts!: TopicQuestionAttemptDto[];
}
