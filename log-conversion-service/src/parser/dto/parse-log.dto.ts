import { IsUrl, IsNotEmpty } from 'class-validator';

export class ParseLogDto {
  @IsNotEmpty()
  readonly sourceUrl: string;
}
