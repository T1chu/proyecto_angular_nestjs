import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

interface RequestWithUser {
  user: {
    sub: string;
    perfil: string;
    nombreUsuario: string;
  };
}

@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('perfil')
  async obtenerMiPerfil(@Req() req: RequestWithUser) {
    return this.usersService.obtenerPerfil(req.user.sub);
  }

  @Put('perfil')
  async actualizarPerfil(
    @Req() req: RequestWithUser,
    @Body() datos: { nombre: string; apellido: string; descripcion: string },
  ) {
    return this.usersService.actualizarPerfil(req.user.sub, datos);
  }

  @Put('perfil/imagen')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `perfil-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Solo se permiten imágenes'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async actualizarImagenPerfil(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }
    return this.usersService.actualizarImagenPerfil(req.user.sub, file);
  }

  @Get(':id')
  async obtenerPerfil(@Param('id') id: string) {
    return this.usersService.obtenerPerfil(id);
  }
}
