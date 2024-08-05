import { IsUrl, IsNotEmpty } from 'class-validator';

export class ParseLogDto {
  @IsUrl()
  @IsNotEmpty()
  readonly sourceUrl: string;
}
