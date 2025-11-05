// src/publications/publications.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { PublicationDocument } from './schemas/publication.schema';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel('Publication')
    private publicationModel: Model<PublicationDocument>,
  ) {}

  async crear(
    createPublicationDto: CreatePublicationDto,
    file: Express.Multer.File,
    usuarioId: string,
  ) {
    const nuevaPublicacion = new this.publicationModel({
      ...createPublicationDto,
      imagen: file ? `http://localhost:3000/uploads/publicaciones/${file.filename}` : null,
      usuario: usuarioId,
    });

    const publicacion = await nuevaPublicacion.save();
    return await publicacion.populate('usuario', '-contrasena');
  }

  async listar(
    ordenamiento: string,
    usuario: string,
    offset: number,
    limit: number,
  ) {
    const filtro: FilterQuery<PublicationDocument> = { activo: true };

    if (usuario) {
      filtro.usuario = usuario;
    }

    const sort: Record<string, 1 | -1> = { createdAt: -1 }; // Por defecto ordenar por fecha descendente

    if (ordenamiento === 'megusta') {
      // Ordenar por cantidad de me gusta
      const publicaciones = await this.publicationModel
        .find(filtro)
        .populate('usuario', '-contrasena')
        .skip(offset)
        .limit(limit)
        .lean();

      // Ordenar manualmente por cantidad de me gusta
      publicaciones.sort(
        (a, b) => (b.meGusta?.length || 0) - (a.meGusta?.length || 0),
      );

      const total = await this.publicationModel.countDocuments(filtro);

      return {
        publicaciones,
        total,
        offset,
        limit,
      };
    }

    const publicaciones = await this.publicationModel
      .find(filtro)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .populate('usuario', '-contrasena');

    const total = await this.publicationModel.countDocuments(filtro);

    return {
      publicaciones,
      total,
      offset,
      limit,
    };
  }

  async eliminar(id: string, usuarioId: string, perfil: string) {
    const publicacion = await this.publicationModel.findById(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Solo el creador o un administrador pueden eliminar
    if (
      publicacion.usuario.toString() !== usuarioId &&
      perfil !== 'administrador'
    ) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta publicación',
      );
    }

    publicacion.activo = false;
    await publicacion.save();

    return { mensaje: 'Publicación eliminada correctamente' };
  }

  async darMeGusta(id: string, usuarioId: string) {
    const publicacion = await this.publicationModel.findById(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (!publicacion.activo) {
      throw new BadRequestException('Publicación no disponible');
    }

    // Verificar si ya le dio me gusta
    if (publicacion.meGusta.some((uid) => uid.toString() === usuarioId)) {
      throw new BadRequestException('Ya le diste me gusta a esta publicación');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    publicacion.meGusta.push(usuarioId as any);
    await publicacion.save();

    return await publicacion.populate('usuario', '-contrasena');
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const publicacion = await this.publicationModel.findById(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar si había dado me gusta
    const index = publicacion.meGusta.findIndex(
      (uid) => uid.toString() === usuarioId,
    );
    if (index === -1) {
      throw new BadRequestException(
        'No le habías dado me gusta a esta publicación',
      );
    }

    publicacion.meGusta.splice(index, 1);
    await publicacion.save();

    return await publicacion.populate('usuario', '-contrasena');
  }
}