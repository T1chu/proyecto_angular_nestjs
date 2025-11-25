// social-network-backend/src/publications/estadisticas.service.ts - FIX DEFINITIVO
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublicationDocument } from './schemas/publication.schema';
import { CommentDocument } from './schemas/comment.schema';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel('Publication')
    private publicationModel: Model<PublicationDocument>,
    @InjectModel('Comment')
    private commentModel: Model<CommentDocument>,
  ) {}

  /** ============================
   *  📌 PUBLICACIONES POR USUARIO
   *  ============================ */
  async publicacionesPorUsuario(fechaInicio: string, fechaFin: string) {
    console.log('\n🔥 === PUBLICACIONES POR USUARIO ===');

    try {
      let filtroFecha: any = { activo: true };

      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        inicio.setHours(0,0,0,0);
        fin.setHours(23,59,59,999);
        filtroFecha.createdAt = { $gte: inicio, $lte: fin };
      }

      console.log('Filtro aplicado:', filtroFecha);

      const resultado = await this.publicationModel.aggregate([
        { $match: filtroFecha },

        {
          $group: {
            _id: "$usuario",     // acá está el ObjectId del usuario
            cantidad: { $sum: 1 }
          }
        },

        // 🔥 LOOKUP COMPATIBLE SIEMPRE (CONVERT STRING → OBJECTID)
        {
          $lookup: {
            from: "users",
            let: { usuarioId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      "$_id",
                      { $convert: { input: "$$usuarioId", to: "objectId", onError: null } }
                    ]
                  }
                }
              }
            ],
            as: "usuarioInfo"
          }
        },

        { $unwind: "$usuarioInfo" },

        {
          $project: {
            _id: 0,
            usuarioId: "$_id",
            cantidad: 1,
            nombreUsuario: "$usuarioInfo.nombreUsuario",
            nombre: {
              $concat: ["$usuarioInfo.nombre", " ", "$usuarioInfo.apellido"]
            }
          }
        },

        { $sort: { cantidad: -1 } }
      ]);

      console.log("Total usuarios:", resultado.length);
      return resultado;

    } catch (error) {
      console.error("❌ ERROR publicacionesPorUsuario:", error);
      return [];
    }
  }

  /** ============================
   *  📌 COMENTARIOS POR PERIODO
   *  ============================ */
  async comentariosPorPeriodo(fechaInicio: string, fechaFin: string) {
    console.log('\n💬 === COMENTARIOS POR PERIODO ===');

    try {
      let filtroFecha: any = {};

      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        inicio.setHours(0,0,0,0);
        fin.setHours(23,59,59,999);

        filtroFecha.createdAt = { $gte: inicio, $lte: fin };
      }

      const resultado = await this.commentModel.aggregate([
        { $match: filtroFecha },

        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            cantidad: { $sum: 1 }
          }
        },

        {
          $addFields: {
            fecha: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              }
            }
          }
        },

        { $project: { _id: 0, fecha: 1, cantidad: 1 } },
        { $sort: { fecha: 1 } }
      ]);

      return resultado;

    } catch (error) {
      console.error("❌ ERROR comentariosPorPeriodo:", error);
      return [];
    }
  }

  /** ============================
   *  📌 COMENTARIOS POR PUBLICACION
   *  ============================ */
  async comentariosPorPublicacion(fechaInicio: string, fechaFin: string) {
    console.log('\n📊 === COMENTARIOS POR PUBLICACION ===');

    try {
      let filtroFecha: any = {};

      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        inicio.setHours(0,0,0,0);
        fin.setHours(23,59,59,999);

        filtroFecha.createdAt = { $gte: inicio, $lte: fin };
      }

      const resultado = await this.commentModel.aggregate([
        { $match: filtroFecha },

        {
          $group: {
            _id: "$publicacion",
            cantidad: { $sum: 1 }
          }
        },

        // 🔥 LOOKUP CORRECTO: RELACIONAR CON PUBLICATIONS (NO USERS)
        {
          $lookup: {
            from: "publications",
            let: { pubId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      "$_id",
                      { $convert: { input: "$$pubId", to: "objectId", onError: null } }
                    ]
                  }
                }
              }
            ],
            as: "publicacionInfo"
          }
        },

        { $unwind: "$publicacionInfo" },

        { $match: { "publicacionInfo.activo": true } },

        {
          $project: {
            _id: 0,
            publicacionId: "$_id",
            cantidad: 1,
            titulo: "$publicacionInfo.titulo"
          }
        },

        { $sort: { cantidad: -1 } },
        { $limit: 10 }
      ]);

      return resultado;

    } catch (error) {
      console.error("❌ ERROR comentariosPorPublicacion:", error);
      return [];
    }
  }
}
