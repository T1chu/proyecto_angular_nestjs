// social-network-backend/src/publications/estadisticas.service.ts - CORREGIDO
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

  async publicacionesPorUsuario(fechaInicio: string, fechaFin: string) {
    console.log('📊 === PUBLICACIONES POR USUARIO (CORREGIDO) ===');
    console.log('Fechas recibidas:', { fechaInicio, fechaFin });
    
    // 🔥 CORRECCIÓN: Si no hay fechas, usar rango completo
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date('2000-01-01');
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    
    // Ajustar inicio al comienzo del día y fin al final del día
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    console.log('📅 Fechas procesadas:', {
      inicio: inicio.toISOString(),
      fin: fin.toISOString()
    });

    try {
      // Debug: Contar todas las publicaciones sin filtro
      const totalTodasPubs = await this.publicationModel.countDocuments({ activo: true });
      console.log('📝 Total publicaciones activas (sin filtro de fecha):', totalTodasPubs);
      
      // Contar publicaciones en el rango
      const totalEnRango = await this.publicationModel.countDocuments({
        createdAt: { $gte: inicio, $lte: fin },
        activo: true,
      });
      
      console.log('📝 Total publicaciones en rango:', totalEnRango);

      // Si no hay publicaciones en el rango, retornar array vacío
      if (totalEnRango === 0) {
        console.log('⚠️ No hay publicaciones en el rango especificado');
        return [];
      }

      const resultado = await this.publicationModel.aggregate([
        {
          $match: {
            createdAt: { $gte: inicio, $lte: fin },
            activo: true,
          },
        },
        {
          $group: {
            _id: '$usuario',
            cantidad: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'usuarioInfo',
          },
        },
        {
          $unwind: '$usuarioInfo',
        },
        {
          $project: {
            _id: 0,
            usuarioId: '$_id',
            cantidad: 1,
            nombreUsuario: '$usuarioInfo.nombreUsuario',
            nombre: {
              $concat: ['$usuarioInfo.nombre', ' ', '$usuarioInfo.apellido'],
            },
          },
        },
        {
          $sort: { cantidad: -1 },
        },
      ]);

      console.log('✅ Resultado agregado:', JSON.stringify(resultado, null, 2));
      console.log('📊 Total usuarios con publicaciones:', resultado.length);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en publicacionesPorUsuario:', error);
      return [];
    }
  }

  async comentariosPorPeriodo(fechaInicio: string, fechaFin: string) {
    console.log('📊 === COMENTARIOS POR PERIODO (CORREGIDO) ===');
    console.log('Fechas recibidas:', { fechaInicio, fechaFin });
    
    // 🔥 CORRECCIÓN: Si no hay fechas, usar rango completo
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date('2000-01-01');
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    console.log('📅 Fechas procesadas:', {
      inicio: inicio.toISOString(),
      fin: fin.toISOString()
    });

    try {
      // Debug: Contar todos los comentarios
      const totalTodosComments = await this.commentModel.countDocuments({});
      console.log('💬 Total comentarios (sin filtro):', totalTodosComments);
      
      // Contar comentarios en el rango
      const totalEnRango = await this.commentModel.countDocuments({
        createdAt: { $gte: inicio, $lte: fin },
      });
      
      console.log('💬 Total comentarios en rango:', totalEnRango);

      if (totalEnRango === 0) {
        console.log('⚠️ No hay comentarios en el rango especificado');
        return [];
      }

      const resultado = await this.commentModel.aggregate([
        {
          $match: {
            createdAt: { $gte: inicio, $lte: fin },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            cantidad: { $sum: 1 },
          },
        },
        {
          $addFields: {
            fecha: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day',
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            fecha: 1,
            cantidad: 1,
          },
        },
        {
          $sort: { fecha: 1 },
        },
      ]);

      console.log('✅ Comentarios por periodo:', JSON.stringify(resultado, null, 2));
      console.log('📊 Total días con comentarios:', resultado.length);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en comentariosPorPeriodo:', error);
      return [];
    }
  }

  async comentariosPorPublicacion(fechaInicio: string, fechaFin: string) {
    console.log('📊 === COMENTARIOS POR PUBLICACIÓN (CORREGIDO) ===');
    console.log('Fechas recibidas:', { fechaInicio, fechaFin });
    
    // 🔥 CORRECCIÓN: Si no hay fechas, usar rango completo
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date('2000-01-01');
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    console.log('📅 Fechas procesadas:', {
      inicio: inicio.toISOString(),
      fin: fin.toISOString()
    });

    try {
      const totalEnRango = await this.commentModel.countDocuments({
        createdAt: { $gte: inicio, $lte: fin },
      });
      
      console.log('💬 Total comentarios en rango:', totalEnRango);

      if (totalEnRango === 0) {
        console.log('⚠️ No hay comentarios en el rango especificado');
        return [];
      }

      const resultado = await this.commentModel.aggregate([
        {
          $match: {
            createdAt: { $gte: inicio, $lte: fin },
          },
        },
        {
          $group: {
            _id: '$publicacion',
            cantidad: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'publications',
            localField: '_id',
            foreignField: '_id',
            as: 'publicacionInfo',
          },
        },
        {
          $unwind: '$publicacionInfo',
        },
        {
          $match: {
            'publicacionInfo.activo': true,
          },
        },
        {
          $project: {
            _id: 0,
            publicacionId: '$_id',
            cantidad: 1,
            titulo: '$publicacionInfo.titulo',
          },
        },
        {
          $sort: { cantidad: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      console.log('✅ Top 10 publicaciones:', JSON.stringify(resultado, null, 2));
      console.log('📊 Total publicaciones con comentarios:', resultado.length);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en comentariosPorPublicacion:', error);
      return [];
    }
  }
}