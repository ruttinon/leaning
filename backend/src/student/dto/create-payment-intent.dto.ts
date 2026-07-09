import { IsOptional, IsString, MaxLength } from 'class-validator'

export class CreatePaymentIntentDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  couponCode?: string
}
