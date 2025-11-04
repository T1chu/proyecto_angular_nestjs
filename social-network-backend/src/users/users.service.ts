// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { PublicationDocument } from '../publications/schemas/publication.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('Publication')
    private publicationModel: Model<PublicationDocument>,
  ) {}

  async obtenerPerfil(id: string) {
    const usuario = await this.userModel.findById(id).select('-contrasena');

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener las últimas 3 publicaciones del usuario
    const publicaciones = await this.publicationModel
      .find({ usuario: id, activo: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('usuario', '-contrasena');

    return {
      usuario,
      publicaciones,
    };
  }
}
