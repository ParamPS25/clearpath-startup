import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ValidateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  pitch?: string;
}
