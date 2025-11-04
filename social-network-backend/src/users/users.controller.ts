// src/users/users.controller.ts
import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
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

  @Get(':id')
  async obtenerPerfil(@Param('id') id: string) {
    return this.usersService.obtenerPerfil(id);
  }
}

