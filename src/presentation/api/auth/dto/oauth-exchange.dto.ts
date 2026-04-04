import { IsNotEmpty, IsString } from 'class-validator';

export class OAuthExchangeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
