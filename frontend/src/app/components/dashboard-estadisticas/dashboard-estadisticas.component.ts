// frontend/src/app/components/dashboard-estadisticas/dashboard-estadisticas.component.ts - CORREGIDO
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { LoadingSpinnerDirective } from '../../directives/loading-spinner.directive';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerDirective],
  templateUrl: './dashboard-estadisticas.component.html',
  styleUrls: ['./dashboard-estadisticas.component.css']
})
export class DashboardEstadisticasComponent implements OnInit, AfterViewInit {
  @ViewChild('chartPublicaciones') chartPublicacionesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartComentariosPeriodo') chartComentariosPeriodoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartComentariosPublicacion') chartComentariosPublicacionRef!: ElementRef<HTMLCanvasElement>;

  fechaInicio: string = '';
  fechaFin: string = '';
  
  publicacionesPorUsuario: any[] = [];
  comentariosPorPeriodo: any[] = [];
  comentariosPorPublicacion: any[] = [];
  
  cargandoPublicaciones: boolean = false;
  cargandoComentarios: boolean = false;
  cargandoComentariosPublicacion: boolean = false;

  private chartsRendered = {
    publicaciones: false,
    comentarios: false,
    publicacionesTop: false
  };

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {
    // 🔥 CORRECCIÓN: Usar fechas más amplias por defecto
    const hoy = new Date();
    const haceUnAnio = new Date();
    haceUnAnio.setFullYear(hoy.getFullYear() - 1); // Hace 1 año
    
    this.fechaInicio = haceUnAnio.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
    
    console.log('📅 Fechas iniciales (1 año):', {
      inicio: this.fechaInicio,
      fin: this.fechaFin
    });
  }

  ngOnInit(): void {
    this.cargarTodasEstadisticas();
  }

  ngAfterViewInit(): void {
    // Renderizar gráficos después de que la vista esté lista
    setTimeout(() => {
      this.renderizarTodosLosGraficos();
    }, 100);
  }

  getTotalComentarios(): number {
    const total = this.comentariosPorPeriodo.reduce((sum, d) => sum + d.cantidad, 0);
    return total;
  }

  getTotalPublicaciones(): number {
    const total = this.publicacionesPorUsuario.reduce((sum, d) => sum + d.cantidad, 0);
    return total;
  }

  getUsuariosActivos(): number {
    return this.publicacionesPorUsuario.length;
  }

  getTopPublicacionComentarios(): number {
    if (this.comentariosPorPublicacion.length === 0) return 0;
    return this.comentariosPorPublicacion[0]?.cantidad || 0;
  }

  cargarTodasEstadisticas(): void {
    console.log('🔄 === CARGANDO TODAS LAS ESTADÍSTICAS ===');
    this.cargarPublicacionesPorUsuario();
    this.cargarComentariosPorPeriodo();
    this.cargarComentariosPorPublicacion();
  }

  cargarPublicacionesPorUsuario(): void {
    console.log('\n📊 === PUBLICACIONES POR USUARIO ===');
    
    this.cargandoPublicaciones = true;
    this.adminService.obtenerPublicacionesPorUsuario(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Datos recibidos:', datos);
        
        this.publicacionesPorUsuario = datos || [];
        this.cargandoPublicaciones = false;
        this.chartsRendered.publicaciones = false;
        
        if (this.publicacionesPorUsuario.length > 0) {
          setTimeout(() => this.renderizarGraficoPublicaciones(), 200);
        } else {
          console.warn('⚠️ No hay datos de publicaciones');
        }
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.cargandoPublicaciones = false;
        this.publicacionesPorUsuario = [];
      }
    });
  }

  cargarComentariosPorPeriodo(): void {
    console.log('\n💬 === COMENTARIOS POR PERIODO ===');
    
    this.cargandoComentarios = true;
    this.adminService.obtenerComentariosPorPeriodo(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Datos recibidos:', datos);
        
        this.comentariosPorPeriodo = datos || [];
        this.cargandoComentarios = false;
        this.chartsRendered.comentarios = false;
        
        if (this.comentariosPorPeriodo.length > 0) {
          setTimeout(() => this.renderizarGraficoComentariosPeriodo(), 200);
        } else {
          console.warn('⚠️ No hay datos de comentarios');
        }
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.cargandoComentarios = false;
        this.comentariosPorPeriodo = [];
      }
    });
  }

  cargarComentariosPorPublicacion(): void {
    console.log('\n📊 === COMENTARIOS POR PUBLICACION ===');
    
    this.cargandoComentariosPublicacion = true;
    this.adminService.obtenerComentariosPorPublicacion(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Datos recibidos:', datos);
        
        this.comentariosPorPublicacion = datos || [];
        this.cargandoComentariosPublicacion = false;
        this.chartsRendered.publicacionesTop = false;
        
        if (this.comentariosPorPublicacion.length > 0) {
          setTimeout(() => this.renderizarGraficoComentariosPublicacion(), 200);
        } else {
          console.warn('⚠️ No hay datos de publicaciones con comentarios');
        }
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.cargandoComentariosPublicacion = false;
        this.comentariosPorPublicacion = [];
      }
    });
  }

  renderizarTodosLosGraficos(): void {
    if (this.publicacionesPorUsuario.length > 0 && !this.chartsRendered.publicaciones) {
      this.renderizarGraficoPublicaciones();
    }
    if (this.comentariosPorPeriodo.length > 0 && !this.chartsRendered.comentarios) {
      this.renderizarGraficoComentariosPeriodo();
    }
    if (this.comentariosPorPublicacion.length > 0 && !this.chartsRendered.publicacionesTop) {
      this.renderizarGraficoComentariosPublicacion();
    }
  }

  renderizarGraficoPublicaciones(): void {
    if (!this.chartPublicacionesRef || this.chartsRendered.publicaciones) return;
    
    console.log('🎨 Renderizando gráfico de publicaciones...');
    const canvas = this.chartPublicacionesRef.nativeElement;
    
    if (!canvas || this.publicacionesPorUsuario.length === 0) {
      console.warn('⚠️ No se puede renderizar');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const barWidth = (width - 2 * padding) / this.publicacionesPorUsuario.length;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
    ctx.fillRect(0, 0, width, height);

    const maxValue = Math.max(...this.publicacionesPorUsuario.map(d => d.cantidad), 1);

    this.publicacionesPorUsuario.forEach((dato, index) => {
      const barHeight = ((dato.cantidad / maxValue) * (height - 2 * padding));
      const x = padding + index * barWidth + barWidth * 0.1;
      const y = height - padding - barHeight;

      const gradient = ctx.createLinearGradient(x, y, x, height - padding);
      gradient.addColorStop(0, '#dc143c');
      gradient.addColorStop(1, '#8b0000');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);

      ctx.fillStyle = '#b0b0b0';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dato.cantidad.toString(), x + barWidth * 0.4, y - 5);
      
      ctx.save();
      ctx.translate(x + barWidth * 0.4, height - padding + 15);
      ctx.rotate(-Math.PI / 4);
      ctx.font = '12px sans-serif';
      ctx.fillText(dato.nombreUsuario.substring(0, 10), 0, 0);
      ctx.restore();
    });

    ctx.fillStyle = '#dc143c';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Publicaciones por Usuario', width / 2, 30);

    this.chartsRendered.publicaciones = true;
    console.log('✅ Gráfico de publicaciones renderizado');
  }

  renderizarGraficoComentariosPeriodo(): void {
    if (!this.chartComentariosPeriodoRef || this.chartsRendered.comentarios) return;
    
    console.log('🎨 Renderizando gráfico de comentarios por periodo...');
    const canvas = this.chartComentariosPeriodoRef.nativeElement;
    
    if (!canvas || this.comentariosPorPeriodo.length === 0) {
      console.warn('⚠️ No se puede renderizar');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
    ctx.fillRect(0, 0, width, height);

    const maxValue = Math.max(...this.comentariosPorPeriodo.map(d => d.cantidad), 1);
    const stepX = (width - 2 * padding) / Math.max(this.comentariosPorPeriodo.length - 1, 1);

    // 🔥 CORRECCIÓN: Dibujar la línea correctamente
    ctx.beginPath();
    ctx.strokeStyle = '#dc143c';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    this.comentariosPorPeriodo.forEach((dato, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((dato.cantidad / maxValue) * (height - 2 * padding));

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Dibujar puntos y valores
    this.comentariosPorPeriodo.forEach((dato, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((dato.cantidad / maxValue) * (height - 2 * padding));

      // Punto
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Borde del punto
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Valor
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dato.cantidad.toString(), x, y - 15);

      // Fecha (cada 3 puntos para no saturar)
      if (index % 3 === 0 || index === this.comentariosPorPeriodo.length - 1) {
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        const fecha = new Date(dato.fecha);
        const fechaTexto = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
        ctx.fillText(fechaTexto, x, height - padding + 20);
      }
    });

    ctx.fillStyle = '#dc143c';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Comentarios por Periodo', width / 2, 30);

    this.chartsRendered.comentarios = true;
    console.log('✅ Gráfico de comentarios por periodo renderizado');
  }

  renderizarGraficoComentariosPublicacion(): void {
    if (!this.chartComentariosPublicacionRef || this.chartsRendered.publicacionesTop) return;
    
    console.log('🎨 Renderizando gráfico de comentarios por publicación...');
    const canvas = this.chartComentariosPublicacionRef.nativeElement;
    
    if (!canvas || this.comentariosPorPublicacion.length === 0) {
      console.warn('⚠️ No se puede renderizar');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 60;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
    ctx.fillRect(0, 0, width, height);

    const total = this.comentariosPorPublicacion.reduce((sum, d) => sum + d.cantidad, 0);
    let currentAngle = -Math.PI / 2;

    const colors = [
      '#dc143c', '#ff1744', '#b01030', '#8b0000', '#ff4757',
      '#c92a2a', '#e03131', '#f03e3e', '#fa5252', '#ff6b6b'
    ];

    this.comentariosPorPublicacion.forEach((dato, index) => {
      const sliceAngle = (dato.cantidad / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.stroke();

      const percentage = ((dato.cantidad / total) * 100).toFixed(1);
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${percentage}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    ctx.fillStyle = '#dc143c';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Top 10 Publicaciones', width / 2, 30);

    this.chartsRendered.publicacionesTop = true;
    console.log('✅ Gráfico de comentarios por publicación renderizado');
  }

  volver(): void {
    this.router.navigate(['/publicaciones']);
  }
}