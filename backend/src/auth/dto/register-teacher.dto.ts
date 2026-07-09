import { IsEmail, IsString, IsOptional } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class RegisterTeacherDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}
