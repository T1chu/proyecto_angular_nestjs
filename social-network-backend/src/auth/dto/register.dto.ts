// social-network-backend/src/auth/dto/register.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  apellido: string;

  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @IsString()
  nombreUsuario: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula y un número',
  })
  contrasena: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @IsDateString()
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || '')
  descripcion?: string;
}
