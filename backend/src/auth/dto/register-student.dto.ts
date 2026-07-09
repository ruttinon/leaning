import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class RegisterStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  grade?: string;
}
