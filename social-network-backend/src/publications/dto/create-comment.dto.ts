// src/publications/dto/create-comment.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString()
  @MaxLength(500, { message: 'El comentario no puede exceder 500 caracteres' })
  mensaje: string;
}
