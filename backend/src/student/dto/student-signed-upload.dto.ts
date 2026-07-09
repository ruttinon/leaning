import { IsOptional, IsString, MaxLength } from 'class-validator'

export class StudentSignedUploadDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  folder?: string

  @IsString()
  @MaxLength(255)
  fileName!: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contentType?: string
}
