import { IsOptional, IsString, MaxLength } from 'class-validator'

export class PaymentWebhookDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  paymentId?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  transactionId?: string

  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string
}
