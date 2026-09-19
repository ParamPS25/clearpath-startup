import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SeoRankRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(253)
  domain: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  keywords: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
