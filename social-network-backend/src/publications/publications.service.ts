// social-network-backend/src/publications/publications.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { PublicationDocument } from './schemas/publication.schema';
import { CommentDocument } from './schemas/comment.schema';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel('Publication')
    private publicationModel: Model<PublicationDocument>,

    @InjectModel('Comment')
    private commentModel: Model<CommentDocument>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async crear(
    createPublicationDto: CreatePublicationDto,
    file: Express.Multer.File,
    usuarioId: string,
  ) {
    let imagenUrl: string = null;

    if (file) {
      const imagenSubida: UploadApiResponse = await cloudinary.uploader.upload(
        file.path,
        { folder: 'publicaciones' },
      );

      imagenUrl = imagenSubida.secure_url;
    }

    const nuevaPublicacion = new this.publicationModel({
      ...createPublicationDto,
      imagen: imagenUrl,
      usuario: usuarioId,
    });

    const publicacion = await nuevaPublicacion.save();
    return publicacion.populate('usuario', '-contrasena');
  }

  async obtenerPorId(id: string) {
    const publicacion = await this.publicationModel
      .findById(id)
      .populate('usuario', '-contrasena');

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const totalComentarios = await this.commentModel.countDocuments({
      publicacion: id,
    });

    return { ...publicacion.toObject(), totalComentarios };
  }

  async listar(ordenamiento: string, usuario: string, offset: number, limit: number) {
    const filtro: FilterQuery<PublicationDocument> = { activo: true };

    if (usuario) filtro.usuario = usuario;

    const publicaciones = await this.publicationModel
      .find(filtro)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('usuario', '-contrasena');

    const total = await this.publicationModel.countDocuments(filtro);

    return { publicaciones, total, offset, limit };
  }

  async eliminar(id: string, usuarioId: string, perfil: string) {
    const publicacion = await this.publicationModel.findById(id);

    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    if (
      String(publicacion.usuario) !== String(usuarioId) &&
      perfil !== 'administrador'
    ) {
      throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    publicacion.activo = false;
    await publicacion.save();

    return { mensaje: 'Publicación eliminada correctamente' };
  }

  // ============================================================
  //   🔥 MÉTODO CORREGIDO — darMeGusta
  // ============================================================
  async darMeGusta(id: string, usuarioId: string) {
    const publicacion = await this.publicationModel.findById(id);

    if (!publicacion) throw new NotFoundException('Publicación no encontrada');
    if (!publicacion.activo)
      throw new BadRequestException('Publicación no disponible');

    const userObjectId = new Types.ObjectId(usuarioId);

    if (publicacion.meGusta.some(uid => uid.toString() === usuarioId)) {
      throw new BadRequestException('Ya le diste me gusta');
    }

    publicacion.meGusta.push(userObjectId);
    await publicacion.save();

    return publicacion.populate('usuario', '-contrasena');
  }

  // ============================================================
  //   🔥 MÉTODO CORREGIDO — quitarMeGusta
  // ============================================================
  async quitarMeGusta(id: string, usuarioId: string) {
    const publicacion = await this.publicationModel.findById(id);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    publicacion.meGusta = publicacion.meGusta.filter(
      uid => uid.toString() !== usuarioId,
    );

    await publicacion.save();
    return publicacion.populate('usuario', '-contrasena');
  }

  async obtenerComentarios(id: string, offset: number, limit: number) {
    const comentarios = await this.commentModel
      .find({ publicacion: id })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('usuario', '-contrasena');

    const total = await this.commentModel.countDocuments({ publicacion: id });

    return { comentarios, total, offset, limit };
  }

  async crearComentario(
    publicacionId: string,
    createCommentDto: CreateCommentDto,
    usuarioId: string,
  ) {
    const comentario = new this.commentModel({
      mensaje: createCommentDto.mensaje,
      usuario: usuarioId,
      publicacion: publicacionId,
    });

    const nuevo = await comentario.save();
    return nuevo.populate('usuario', '-contrasena');
  }

  async modificarComentario(
    comentarioId: string,
    updateCommentDto: UpdateCommentDto,
    usuarioId: string,
  ) {
    const comentario = await this.commentModel.findById(comentarioId);

    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    if (String(comentario.usuario) !== String(usuarioId))
      throw new ForbiddenException('No autorizado');

    comentario.mensaje = updateCommentDto.mensaje;
    comentario.modificado = true;

    await comentario.save();
    return comentario.populate('usuario', '-contrasena');
  }

  async eliminarComentario(comentarioId: string, usuarioId: string, perfil: string) {
    const comentario = await this.commentModel.findById(comentarioId);

    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    if (
      String(comentario.usuario) !== String(usuarioId) &&
      perfil !== 'administrador'
    )
      throw new ForbiddenException('No autorizado');

    await this.commentModel.findByIdAndDelete(comentarioId);
    return { mensaje: 'Comentario eliminado correctamente' };
  }
}
