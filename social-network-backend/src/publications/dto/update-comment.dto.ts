import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString()
  @MaxLength(500)
  mensaje: string;
}
