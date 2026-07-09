import { IsString, MinLength } from 'class-validator'
import { IsStrongPassword } from '../../common/validators/password.validator'

export class ChangePasswordDto {
  @IsString()
  currentPassword: string

  @IsString()
  @IsStrongPassword()
  newPassword: string
}

export class ResetPasswordDto {
  @IsString()
  token: string

  @IsString()
  @IsStrongPassword()
  newPassword: string
}
