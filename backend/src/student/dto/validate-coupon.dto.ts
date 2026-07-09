import { IsString, MaxLength } from 'class-validator'

export class ValidateCouponDto {
  @IsString()
  @MaxLength(64)
  code: string

  @IsString()
  courseId: string
}
