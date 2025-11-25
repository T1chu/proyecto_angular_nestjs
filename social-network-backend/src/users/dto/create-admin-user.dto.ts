// social-network-backend/src/users/dto/create-admin-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateAdminUserDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @IsNotEmpty()
  @IsString()
  nombreUsuario: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula y un número',
  })
  contrasena: string;

  @IsNotEmpty()
  @IsDateString()
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNotEmpty()
  @IsEnum(['usuario', 'administrador'], {
    message: 'El perfil debe ser "usuario" o "administrador"',
  })
  perfil: 'usuario' | 'administrador';
}
