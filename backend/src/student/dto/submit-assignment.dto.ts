import { IsOptional, IsString, MaxLength } from 'class-validator'

export class SubmitAssignmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  textAnswer?: string

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  fileUrl?: string
}
