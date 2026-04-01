import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const DEFAULT_MAX = 4000;
const MAX_CODE_LENGTH = Number(process.env.AI_MAX_MESSAGE_LENGTH) || DEFAULT_MAX;

export class PostCodeTaskDragDropDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CODE_LENGTH, {
    message: `code must not exceed ${MAX_CODE_LENGTH} characters`,
  })
  code!: string;
}
