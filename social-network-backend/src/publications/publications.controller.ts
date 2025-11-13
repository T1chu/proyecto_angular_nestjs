// src/publications/publications.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { AuthGuard } from '../auth/auth.guard';

interface RequestWithUser {
  user: {
    sub: string;
    perfil: string;
    nombreUsuario: string;
  };
}

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/publicaciones',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `pub-${uniqueSuffix}${ext}`);
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
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async crear(
    @Body() createPublicationDto: CreatePublicationDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return this.publicationsService.crear(
      createPublicationDto,
      file,
      req.user.sub,
    );
  }

  @Get()
  async listar(
    @Query('ordenamiento') ordenamiento: string = 'fecha',
    @Query('usuario') usuario: string,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 10,
  ) {
    return this.publicationsService.listar(
      ordenamiento,
      usuario,
      Number(offset),
      Number(limit),
    );
  }

  @Delete(':id')
  @HttpCode(200)
  async eliminar(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.publicationsService.eliminar(id, req.user.sub, req.user.perfil);
  }

  @Post(':id/megusta')
  async darMeGusta(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.publicationsService.darMeGusta(id, req.user.sub);
  }

  @Delete(':id/megusta')
  @HttpCode(200)
  async quitarMeGusta(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.publicationsService.quitarMeGusta(id, req.user.sub);
  }
}
