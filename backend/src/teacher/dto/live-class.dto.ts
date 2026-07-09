import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator'

export class CreateLiveClassDto {
  @IsString()
  @MinLength(3)
  courseId: string

  @IsString()
  @MinLength(3)
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsUrl()
  meetingUrl: string

  @IsOptional()
  @IsIn(['ZOOM', 'GOOGLE_MEET', 'MANUAL'])
  meetingProvider?: string

  @IsDateString()
  scheduledAt: string

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number
}

export class UpdateLiveClassDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUrl()
  meetingUrl?: string

  @IsOptional()
  @IsIn(['ZOOM', 'GOOGLE_MEET', 'MANUAL'])
  meetingProvider?: string

  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number

  @IsOptional()
  @IsIn(['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED'])
  status?: string
}
