// social-network-backend/src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

interface RequestWithUser {
  user: { sub: string; perfil: string; nombreUsuario: string };
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// COMPATIBLE CON TU VERSIÓN (params vacío)
const storagePerfil = new CloudinaryStorage({
  cloudinary,
  params: {},
});

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
  @UseInterceptors(FileInterceptor('imagenPerfil', { storage: storagePerfil }))
  async actualizarImagenPerfil(
    @Req() req: RequestWithUser,
    @UploadedFile() file: any,
  ) {
    if (!file) throw new BadRequestException('No se subió ninguna imagen');

    // versión vieja → usar URL
    return this.usersService.actualizarImagenPerfil(req.user.sub, file.url);
  }

  @Get(':id')
  async obtenerPerfil(@Param('id') id: string) {
    return this.usersService.obtenerPerfil(id);
  }

  // ADMIN ====

  @Get()
  @UseGuards(AdminGuard)
  async listarUsuarios() {
    return this.usersService.listarUsuarios();
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil', { storage: storagePerfil }))
  async crearUsuario(
    @Body() createAdminUserDto: CreateAdminUserDto,
    @UploadedFile() file: any,
  ) {
    return this.usersService.crearUsuario(createAdminUserDto, file);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deshabilitarUsuario(@Param('id') id: string) {
    return this.usersService.deshabilitarUsuario(id);
  }

  @Post(':id/habilitar')
  @UseGuards(AdminGuard)
  async habilitarUsuario(@Param('id') id: string) {
    return this.usersService.habilitarUsuario(id);
  }
}
