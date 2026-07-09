import { IsString, MaxLength, MinLength } from 'class-validator'

export class ConfirmPaymentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  transactionId!: string
}
