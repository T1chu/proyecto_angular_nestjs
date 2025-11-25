import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePublicationDto {
  @IsNotEmpty({ message: 'El titulo es requerido' })
  @IsString()
  titulo: string;

  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString()
  mensaje: string;
}
