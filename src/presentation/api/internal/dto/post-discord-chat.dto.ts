import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const DEFAULT_MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGE_LENGTH = Number(process.env.AI_MAX_MESSAGE_LENGTH) || DEFAULT_MAX_MESSAGE_LENGTH;

export class PostDiscordChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32, { message: 'discordChannelId is too long' })
  discordChannelId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32, { message: 'discordUserId is too long' })
  discordUserId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_MESSAGE_LENGTH, {
    message: `message must not exceed ${MAX_MESSAGE_LENGTH} characters`,
  })
  message!: string;
}
