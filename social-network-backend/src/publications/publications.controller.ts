// social-network-backend/src/publications/publications.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
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
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../auth/auth.guard';

interface RequestWithUser {
  user: { sub: string; perfil: string; nombreUsuario: string };
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage compatible con TU versión
const storagePublicaciones = new CloudinaryStorage({
  cloudinary,
  params: {},
});

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage: storagePublicaciones }))
  async crear(
    @Body() createPublicationDto: CreatePublicationDto,
    @UploadedFile() file: any,
    @Req() req: RequestWithUser,
  ) {
    return this.publicationsService.crear(
      createPublicationDto,
      file?.url || null,
      req.user.sub,
    );
  }

  @Get()
  async listar(
    @Query('ordenamiento') ordenamiento = 'fecha',
    @Query('usuario') usuario: string,
    @Query('offset') offset = 0,
    @Query('limit') limit = 10,
  ) {
    return this.publicationsService.listar(
      ordenamiento,
      usuario,
      Number(offset),
      Number(limit),
    );
  }

  @Get(':id')
  async obtenerPublicacion(@Param('id') id: string) {
    return this.publicationsService.obtenerPorId(id);
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

  @Get(':id/comentarios')
  async obtenerComentarios(
    @Param('id') id: string,
    @Query('offset') offset = 0,
    @Query('limit') limit = 10,
  ) {
    return this.publicationsService.obtenerComentarios(
      id,
      Number(offset),
      Number(limit),
    );
  }

  @Post(':id/comentarios')
  async crearComentario(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.publicationsService.crearComentario(
      id,
      createCommentDto,
      req.user.sub,
    );
  }

  @Put(':id/comentarios/:comentarioId')
  async modificarComentario(
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.publicationsService.modificarComentario(
      comentarioId,
      updateCommentDto,
      req.user.sub,
    );
  }

  @Delete(':id/comentarios/:comentarioId')
  @HttpCode(200)
  async eliminarComentario(
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.publicationsService.eliminarComentario(
      comentarioId,
      req.user.sub,
      req.user.perfil,
    );
  }
}
