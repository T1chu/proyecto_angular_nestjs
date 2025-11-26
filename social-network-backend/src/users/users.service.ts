// social-network-backend/src/users/users.service.ts (ACTUALIZADO)
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { PublicationDocument } from '../publications/schemas/publication.schema';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import * as bcrypt from 'bcrypt';
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

    // borrar la anterior
    if (usuario.imagenPerfil) {
      const imagenAnterior = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'perfiles',
        usuario.imagenPerfil, // ← YA ES SOLO EL FILENAME
      );

      if (fs.existsSync(imagenAnterior)) {
        try { fs.unlinkSync(imagenAnterior); } catch {}
      }
    }

    // guardar SOLO EL NOMBRE DEL ARCHIVO
    usuario.imagenPerfil = file.filename;

    await usuario.save();

    return {
      imagenPerfil: usuario.imagenPerfil,
    };
  }


  // ===== MÉTODOS DE ADMINISTRACIÓN =====

  async listarUsuarios() {
    return await this.userModel.find().select('-contrasena').sort({ createdAt: -1 });
  }

  async crearUsuario(
    createAdminUserDto: CreateAdminUserDto,
    file: Express.Multer.File,
  ) {
    const { correo, nombreUsuario, contrasena, ...resto } = createAdminUserDto;

    const correoExiste = await this.userModel.findOne({ correo });
    if (correoExiste) {
      throw new ConflictException('El correo ya está registrado');
    }

    const usuarioExiste = await this.userModel.findOne({ nombreUsuario });
    if (usuarioExiste) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = new this.userModel({
      ...resto,
      correo,
      nombreUsuario,
      contrasena: hashedPassword,
      imagenPerfil: file ? file.filename : null,
    });

    await nuevoUsuario.save();

    return {
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        nombreUsuario: nuevoUsuario.nombreUsuario,
        correo: nuevoUsuario.correo,
        imagenPerfil: nuevoUsuario.imagenPerfil,
        perfil: nuevoUsuario.perfil,
        activo: nuevoUsuario.activo,
      },
    };
  }

  async deshabilitarUsuario(id: string) {
    const usuario = await this.userModel.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.activo = false;
    await usuario.save();

    return {
      mensaje: 'Usuario deshabilitado correctamente',
      usuario: {
        id: usuario._id,
        nombreUsuario: usuario.nombreUsuario,
        activo: usuario.activo,
      },
    };
  }

  async habilitarUsuario(id: string) {
    const usuario = await this.userModel.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.activo = true;
    await usuario.save();

    return {
      mensaje: 'Usuario habilitado correctamente',
      usuario: {
        id: usuario._id,
        nombreUsuario: usuario.nombreUsuario,
        activo: usuario.activo,
      },
    };
  }
}
