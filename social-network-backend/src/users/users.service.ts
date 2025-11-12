import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { PublicationDocument } from '../publications/schemas/publication.schema';
import * as fs from 'fs';
import * as path from 'path';

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

  async actualizarPerfil(
    id: string,
    datos: { nombre: string; apellido: string; descripcion: string },
  ) {
    const usuario = await this.userModel.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.nombre = datos.nombre;
    usuario.apellido = datos.apellido;
    usuario.descripcion = datos.descripcion;

    await usuario.save();

    return {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      descripcion: usuario.descripcion,
    };
  }

  async actualizarImagenPerfil(id: string, file: Express.Multer.File) {
    const usuario = await this.userModel.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.imagenPerfil) {
      const nombreArchivo = usuario.imagenPerfil.split('/').pop();
      if (nombreArchivo) {
        const imagenAnterior = path.join(
          __dirname,
          '..',
          '..',
          'uploads',
          'perfiles',
          nombreArchivo,
        );
        if (fs.existsSync(imagenAnterior)) {
          try {
            fs.unlinkSync(imagenAnterior);
          } catch (error) {
            console.error('Error al eliminar imagen anterior:', error);
          }
        }
      }
    }

    usuario.imagenPerfil = `/uploads/perfiles/${file.filename}`;
    await usuario.save();

    return {
      imagenPerfil: usuario.imagenPerfil,
    };
  }
}