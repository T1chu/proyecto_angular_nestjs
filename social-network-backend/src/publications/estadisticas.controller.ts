// social-network-backend/src/publications/estadisticas.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('estadisticas')
@UseGuards(AuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  async publicacionesPorUsuario(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    console.log('📊 GET /estadisticas/publicaciones-por-usuario', { fechaInicio, fechaFin });
    const resultado = await this.estadisticasService.publicacionesPorUsuario(
      fechaInicio,
      fechaFin,
    );
    console.log('📤 Enviando resultado:', resultado);
    return resultado;
  }

  @Get('comentarios-por-periodo')
  async comentariosPorPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    console.log('📊 GET /estadisticas/comentarios-por-periodo', { fechaInicio, fechaFin });
    return this.estadisticasService.comentariosPorPeriodo(
      fechaInicio,
      fechaFin,
    );
  }

  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    console.log('📊 GET /estadisticas/comentarios-por-publicacion', { fechaInicio, fechaFin });
    return this.estadisticasService.comentariosPorPublicacion(
      fechaInicio,
      fechaFin,
    );
  }
}
