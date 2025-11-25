// src/auth/dto/login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  usuarioOCorreo: string;

  @IsNotEmpty()
  @IsString()
  contrasena: string;
}
