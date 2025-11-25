// social-network-backend/src/publications/estadisticas.service.ts - DEBUG EXTREMO
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
    console.log('\n\n🔥🔥🔥 === PUBLICACIONES POR USUARIO === 🔥🔥🔥');
    console.log('📅 Parámetros recibidos:', { fechaInicio, fechaFin });
    
    try {
      // 🔥 PASO 1: Contar TODAS las publicaciones sin filtro
      const todasPublicaciones = await this.publicationModel.find({ activo: true }).lean();
      console.log('\n📊 TODAS LAS PUBLICACIONES ACTIVAS:', todasPublicaciones.length);
      todasPublicaciones.forEach((pub: any, i) => {
        console.log(`   ${i + 1}. "${pub.titulo}" - Fecha: ${pub.createdAt}`);
      });
      
      // 🔥 PASO 2: Construir filtro
      let filtroFecha: any = { activo: true };
      
      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);
        
        console.log('\n🔍 APLICANDO FILTRO DE FECHAS:');
        console.log('   Inicio:', inicio.toISOString());
        console.log('   Fin:', fin.toISOString());
        
        filtroFecha.createdAt = { $gte: inicio, $lte: fin };
      } else {
        console.log('\n✅ SIN FILTRO DE FECHAS - Mostrando TODAS');
      }
      
      // 🔥 PASO 3: Contar con filtro
      const conFiltro = await this.publicationModel.find(filtroFecha).lean();
      console.log(`\n📊 PUBLICACIONES CON FILTRO: ${conFiltro.length}`);
      conFiltro.forEach((pub: any, i) => {
        console.log(`   ${i + 1}. "${pub.titulo}"`);
      });

      if (conFiltro.length === 0) {
        console.log('\n⚠️⚠️⚠️ NO HAY PUBLICACIONES EN EL RANGO ⚠️⚠️⚠️');
        return [];
      }

      // 🔥 PASO 4: Agregación
      console.log('\n🔄 Ejecutando agregación...');
      const resultado = await this.publicationModel.aggregate([
        {
          $match: filtroFecha,
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

      console.log('\n✅✅✅ RESULTADO FINAL ✅✅✅');
      console.log('Total usuarios con publicaciones:', resultado.length);
      resultado.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.nombreUsuario} (${r.nombre}): ${r.cantidad} publicaciones`);
      });
      console.log('🔥🔥🔥 ============================= 🔥🔥🔥\n\n');
      
      return resultado;
    } catch (error) {
      console.error('❌❌❌ ERROR FATAL:', error);
      return [];
    }
  }

  async comentariosPorPeriodo(fechaInicio: string, fechaFin: string) {
    console.log('\n\n💬💬💬 === COMENTARIOS POR PERIODO === 💬💬💬');
    console.log('📅 Parámetros recibidos:', { fechaInicio, fechaFin });
    
    try {
      const todosComentarios = await this.commentModel.find({}).lean();
      console.log('\n📊 TODOS LOS COMENTARIOS:', todosComentarios.length);
      
      let filtroFecha: any = {};
      
      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);
        
        console.log('\n🔍 APLICANDO FILTRO:');
        console.log('   Inicio:', inicio.toISOString());
        console.log('   Fin:', fin.toISOString());
        
        filtroFecha.createdAt = { $gte: inicio, $lte: fin };
      } else {
        console.log('\n✅ SIN FILTRO - Mostrando TODOS');
      }

      const resultado = await this.commentModel.aggregate([
        {
          $match: filtroFecha,
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

      console.log('\n✅✅✅ RESULTADO FINAL ✅✅✅');
      console.log('Total días con comentarios:', resultado.length);
      resultado.forEach((r, i) => {
        const fecha = new Date(r.fecha);
        console.log(`   ${i + 1}. ${fecha.toLocaleDateString()}: ${r.cantidad} comentarios`);
      });
      console.log('💬💬💬 ============================= 💬💬💬\n\n');
      
      return resultado;
    } catch (error) {
      console.error('❌❌❌ ERROR FATAL:', error);
      return [];
    }
  }

  async comentariosPorPublicacion(fechaInicio: string, fechaFin: string) {
    console.log('\n\n📊📊📊 === COMENTARIOS POR PUBLICACION === 📊📊📊');
    console.log('📅 Parámetros recibidos:', { fechaInicio, fechaFin });
    
    try {
      const todosComentarios = await this.commentModel.find({}).lean();
      console.log('\n📊 TODOS LOS COMENTARIOS:', todosComentarios.length);
      
      let filtroFecha: any = {};
      
      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);
        
        console.log('\n🔍 APLICANDO FILTRO:');
        console.log('   Inicio:', inicio.toISOString());
        console.log('   Fin:', fin.toISOString());
        
        filtroFecha.createdAt = { $gte: inicio, $lte: fin };
      } else {
        console.log('\n✅ SIN FILTRO - Mostrando TODOS');
      }

      const resultado = await this.commentModel.aggregate([
        {
          $match: filtroFecha,
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

      console.log('\n✅✅✅ RESULTADO FINAL ✅✅✅');
      console.log('Total publicaciones en top 10:', resultado.length);
      resultado.forEach((r, i) => {
        console.log(`   ${i + 1}. "${r.titulo}": ${r.cantidad} comentarios`);
      });
      console.log('📊📊📊 ============================= 📊📊📊\n\n');
      
      return resultado;
    } catch (error) {
      console.error('❌❌❌ ERROR FATAL:', error);
      return [];
    }
  }
}