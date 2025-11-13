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
import { CommentDocument } from './schemas/comment.schema';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel('Publication') private publicationModel: Model<PublicationDocument>,
    @InjectModel('Comment') private commentModel: Model<CommentDocument>,
  ) {}

  async crear(createPublicationDto: CreatePublicationDto, file: Express.Multer.File, usuarioId: string) {
    const nuevaPublicacion = new this.publicationModel({
      ...createPublicationDto,
      imagen: file ? `/uploads/publicaciones/${file.filename}` : null,
      usuario: usuarioId,
    });

    const publicacion = await nuevaPublicacion.save();
    return await publicacion.populate('usuario', '-contrasena');
  }

  async obtenerPorId(id: string) {
    const publicacion = await this.publicationModel.findById(id).populate('usuario', '-contrasena');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const totalComentarios = await this.commentModel.countDocuments({ publicacion: id });

    return {
      ...publicacion.toObject(),
      totalComentarios,
    };
  }

  async listar(ordenamiento: string, usuario: string, offset: number, limit: number) {
    const filtro: FilterQuery<PublicationDocument> = { activo: true };

    if (usuario) {
      filtro.usuario = usuario;
    }

    const sort: Record<string, 1 | -1> = { createdAt: -1 };

    if (ordenamiento === 'megusta') {
      const publicaciones = await this.publicationModel
        .find(filtro)
        .populate('usuario', '-contrasena')
        .skip(offset)
        .limit(limit)
        .lean();

      publicaciones.sort((a, b) => (b.meGusta?.length || 0) - (a.meGusta?.length || 0));

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

    const publicacionUsuarioId = String(publicacion.usuario);
    const solicitanteId = String(usuarioId);

    if (publicacionUsuarioId !== solicitanteId && perfil !== 'administrador') {
      throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
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

    if (publicacion.meGusta.some((uid) => String(uid) === String(usuarioId))) {
      throw new BadRequestException('Ya le diste me gusta a esta publicación');
    }

    publicacion.meGusta.push(usuarioId as any);
    await publicacion.save();

    return await publicacion.populate('usuario', '-contrasena');
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const publicacion = await this.publicationModel.findById(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const index = publicacion.meGusta.findIndex((uid) => String(uid) === String(usuarioId));

    if (index === -1) {
      return await publicacion.populate('usuario', '-contrasena');
    }

    publicacion.meGusta.splice(index, 1);
    await publicacion.save();

    return await publicacion.populate('usuario', '-contrasena');
  }

  async obtenerComentarios(id: string, offset: number, limit: number) {
    const publicacion = await this.publicationModel.findById(id);
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const comentarios = await this.commentModel
      .find({ publicacion: id })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('usuario', '-contrasena');

    const total = await this.commentModel.countDocuments({ publicacion: id });

    return {
      comentarios,
      total,
      offset,
      limit,
    };
  }

  async crearComentario(publicacionId: string, createCommentDto: CreateCommentDto, usuarioId: string) {
    const publicacion = await this.publicationModel.findById(publicacionId);
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (!publicacion.activo) {
      throw new BadRequestException('No se puede comentar en esta publicación');
    }

    const nuevoComentario = new this.commentModel({
      mensaje: createCommentDto.mensaje,
      usuario: usuarioId,
      publicacion: publicacionId,
    });

    const comentario = await nuevoComentario.save();
    return await comentario.populate('usuario', '-contrasena');
  }

  async modificarComentario(comentarioId: string, updateCommentDto: UpdateCommentDto, usuarioId: string) {
    const comentario = await this.commentModel.findById(comentarioId);

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (String(comentario.usuario) !== String(usuarioId)) {
      throw new ForbiddenException('No tienes permiso para editar este comentario');
    }

    comentario.mensaje = updateCommentDto.mensaje;
    comentario.modificado = true;

    await comentario.save();
    return await comentario.populate('usuario', '-contrasena');
  }
}