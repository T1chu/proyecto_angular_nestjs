// frontend/src/app/components/dashboard-estadisticas/dashboard-estadisticas.component.ts - FORZAR ACTUALIZACIÓN
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
export class DashboardEstadisticasComponent implements OnInit {
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
  
  // 🔥 Contador para forzar re-render
  private renderKey: number = 0;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.fechaInicio = '';
    this.fechaFin = '';
  }

  ngOnInit(): void {
    console.log('🚀 === COMPONENTE INICIADO ===');
    this.cargarTodasEstadisticas();
  }

  getTotalComentarios(): number {
    const total = this.comentariosPorPeriodo.reduce((sum, d) => sum + d.cantidad, 0);
    console.log('🔢 Total comentarios calculado:', total);
    return total;
  }

  getTotalPublicaciones(): number {
    const total = this.publicacionesPorUsuario.reduce((sum, d) => sum + d.cantidad, 0);
    console.log('🔢 Total publicaciones calculado:', total);
    return total;
  }

  getUsuariosActivos(): number {
    const total = this.publicacionesPorUsuario.length;
    console.log('🔢 Usuarios activos:', total);
    return total;
  }

  getTopPublicacionComentarios(): number {
    if (this.comentariosPorPublicacion.length === 0) return 0;
    const top = this.comentariosPorPublicacion[0]?.cantidad || 0;
    console.log('🔢 Top publicación comentarios:', top);
    return top;
  }

  cargarTodasEstadisticas(): void {
    console.log('\n🔄 === BOTÓN ACTUALIZAR PRESIONADO ===');
    console.log('Fechas:', { inicio: this.fechaInicio, fin: this.fechaFin });
    
    // 🔥 Incrementar el contador
    this.renderKey++;
    
    // 🔥 Limpiar datos anteriores INMEDIATAMENTE
    this.publicacionesPorUsuario = [];
    this.comentariosPorPeriodo = [];
    this.comentariosPorPublicacion = [];
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    console.log('📊 Estadísticas limpiadas, cargando nuevos datos...');
    
    // Cargar nuevos datos
    this.cargarPublicacionesPorUsuario();
    this.cargarComentariosPorPeriodo();
    this.cargarComentariosPorPublicacion();
    
    // 🔥 FORZAR actualización de estadísticas después de un tiempo
    setTimeout(() => {
      console.log('\n🔢 === VERIFICANDO ESTADÍSTICAS ===');
      console.log('Total Publicaciones:', this.getTotalPublicaciones());
      console.log('Total Comentarios:', this.getTotalComentarios());
      console.log('Usuarios Activos:', this.getUsuariosActivos());
      console.log('Top Publicación:', this.getTopPublicacionComentarios());
      
      // Forzar actualización de la vista
      this.cdr.detectChanges();
    }, 1000);
  }

  cargarPublicacionesPorUsuario(): void {
    console.log('\n📊 [1/3] Cargando publicaciones por usuario...');
    
    this.cargandoPublicaciones = true;
    
    this.adminService.obtenerPublicacionesPorUsuario(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Publicaciones recibidas:', datos);
        console.log('   Total usuarios:', datos?.length || 0);
        
        this.publicacionesPorUsuario = datos || [];
        this.cargandoPublicaciones = false;
        
        // 🔥 FORZAR actualización de estadísticas
        console.log('📊 Actualizando estadísticas de publicaciones...');
        console.log('   Total publicaciones:', this.getTotalPublicaciones());
        console.log('   Usuarios activos:', this.getUsuariosActivos());
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        if (this.publicacionesPorUsuario.length > 0) {
          setTimeout(() => {
            if (this.chartPublicacionesRef) {
              console.log('🎨 Renderizando gráfico de publicaciones...');
              this.renderizarGraficoPublicaciones();
              // Forzar detección después de renderizar
              this.cdr.detectChanges();
            } else {
              console.error('❌ chartPublicacionesRef no disponible');
            }
          }, 200);
        } else {
          console.warn('⚠️ No hay datos de publicaciones para mostrar');
        }
      },
      error: (error) => {
        console.error('❌ Error cargando publicaciones:', error);
        this.cargandoPublicaciones = false;
        this.publicacionesPorUsuario = [];
        this.cdr.detectChanges();
      }
    });
  }

  cargarComentariosPorPeriodo(): void {
    console.log('\n💬 [2/3] Cargando comentarios por periodo...');
    
    this.cargandoComentarios = true;
    
    this.adminService.obtenerComentariosPorPeriodo(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Comentarios recibidos:', datos);
        console.log('   Total periodos:', datos?.length || 0);
        
        this.comentariosPorPeriodo = datos || [];
        this.cargandoComentarios = false;
        
        this.cdr.detectChanges();
        
        if (this.comentariosPorPeriodo.length > 0) {
          setTimeout(() => {
            if (this.chartComentariosPeriodoRef) {
              console.log('🎨 Renderizando gráfico de comentarios por periodo...');
              this.renderizarGraficoComentariosPeriodo();
            } else {
              console.error('❌ chartComentariosPeriodoRef no disponible');
            }
          }, 200);
        } else {
          console.warn('⚠️ No hay datos de comentarios para mostrar');
        }
      },
      error: (error) => {
        console.error('❌ Error cargando comentarios:', error);
        this.cargandoComentarios = false;
        this.comentariosPorPeriodo = [];
      }
    });
  }

  cargarComentariosPorPublicacion(): void {
    console.log('\n📊 [3/3] Cargando comentarios por publicación...');
    
    this.cargandoComentariosPublicacion = true;
    
    this.adminService.obtenerComentariosPorPublicacion(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Top publicaciones recibidas:', datos);
        console.log('   Total publicaciones:', datos?.length || 0);
        
        this.comentariosPorPublicacion = datos || [];
        this.cargandoComentariosPublicacion = false;
        
        // 🔥 FORZAR actualización de estadísticas
        console.log('📊 Actualizando top publicación...');
        console.log('   Top comentarios:', this.getTopPublicacionComentarios());
        
        this.cdr.detectChanges();
        
        if (this.comentariosPorPublicacion.length > 0) {
          setTimeout(() => {
            if (this.chartComentariosPublicacionRef) {
              console.log('🎨 Renderizando gráfico de top publicaciones...');
              this.renderizarGraficoComentariosPublicacion();
              // Forzar detección después de renderizar
              this.cdr.detectChanges();
            } else {
              console.error('❌ chartComentariosPublicacionRef no disponible');
            }
          }, 200);
        } else {
          console.warn('⚠️ No hay datos de top publicaciones para mostrar');
        }
      },
      error: (error) => {
        console.error('❌ Error cargando top publicaciones:', error);
        this.cargandoComentariosPublicacion = false;
        this.comentariosPorPublicacion = [];
        this.cdr.detectChanges();
      }
    });
  }

  renderizarGraficoPublicaciones(): void {
    const canvas = this.chartPublicacionesRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ No se pudo obtener contexto 2D');
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const padding = 80; // Aumentar padding
    const barWidth = (width - 2 * padding) / Math.max(this.publicacionesPorUsuario.length, 1);

    console.log('🎨 Dimensiones:', { width, height, padding, barWidth });
    console.log('📊 Datos a graficar:', this.publicacionesPorUsuario);

    // 🔥 LIMPIAR COMPLETAMENTE con fondo oscuro
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const maxValue = Math.max(...this.publicacionesPorUsuario.map(d => d.cantidad), 1);
    console.log('📈 Valor máximo:', maxValue);

    this.publicacionesPorUsuario.forEach((dato, index) => {
      const barHeight = ((dato.cantidad / maxValue) * (height - 2 * padding));
      const x = padding + index * barWidth + barWidth * 0.1;
      const y = height - padding - barHeight;

      console.log(`   Barra ${index + 1}: ${dato.nombreUsuario} = ${dato.cantidad}`);

      const gradient = ctx.createLinearGradient(x, y, x, height - padding);
      gradient.addColorStop(0, '#ff1744');
      gradient.addColorStop(1, '#dc143c');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);

      // Número encima de la barra
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dato.cantidad.toString(), x + barWidth * 0.4, y - 15);
      
      // Nombre del usuario
      ctx.save();
      ctx.translate(x + barWidth * 0.4, height - padding + 25);
      ctx.rotate(-Math.PI / 6);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(dato.nombreUsuario.substring(0, 15), 0, 0);
      ctx.restore();
    });

    // Título
    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Publicaciones por Usuario', width / 2, 35);

    // Bordes del área de datos
    ctx.strokeStyle = 'rgba(220, 20, 60, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);

    console.log('✅ Gráfico de publicaciones COMPLETADO');
  }

  renderizarGraficoComentariosPeriodo(): void {
    const canvas = this.chartComentariosPeriodoRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 80;

    console.log('🎨 Renderizando comentarios por periodo...');
    console.log('📊 Datos:', this.comentariosPorPeriodo);

    // Fondo oscuro
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const maxValue = Math.max(...this.comentariosPorPeriodo.map(d => d.cantidad), 1);
    const stepX = (width - 2 * padding) / Math.max(this.comentariosPorPeriodo.length - 1, 1);

    // Línea principal
    ctx.beginPath();
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 5;
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

    // Puntos y valores
    this.comentariosPorPeriodo.forEach((dato, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((dato.cantidad / maxValue) * (height - 2 * padding));

      // Punto
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Borde blanco
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Valor
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dato.cantidad.toString(), x, y - 25);

      // Fecha
      if (index % 2 === 0 || index === this.comentariosPorPeriodo.length - 1) {
        ctx.fillStyle = '#aaa';
        ctx.font = '12px sans-serif';
        const fecha = new Date(dato.fecha);
        const fechaTexto = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
        ctx.fillText(fechaTexto, x, height - padding + 30);
      }
    });

    // Título
    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Comentarios por Periodo', width / 2, 35);

    // Bordes
    ctx.strokeStyle = 'rgba(220, 20, 60, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);

    console.log('✅ Gráfico de comentarios COMPLETADO');
  }

  renderizarGraficoComentariosPublicacion(): void {
    const canvas = this.chartComentariosPublicacionRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 80;

    console.log('🎨 Renderizando top publicaciones...');
    console.log('📊 Datos:', this.comentariosPorPublicacion);

    // Fondo oscuro
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const total = this.comentariosPorPublicacion.reduce((sum, d) => sum + d.cantidad, 0);
    let currentAngle = -Math.PI / 2;

    const colors = [
      '#ff1744', '#dc143c', '#ff4757', '#e03131', '#fa5252',
      '#c92a2a', '#f03e3e', '#ff6b6b', '#b01030', '#8b0000'
    ];

    this.comentariosPorPublicacion.forEach((dato, index) => {
      const sliceAngle = (dato.cantidad / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      // Borde entre secciones
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Porcentaje
      const percentage = ((dato.cantidad / total) * 100).toFixed(1);
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.65);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.65);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Fondo semi-opaco para el texto
      const textWidth = ctx.measureText(`${percentage}%`).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(labelX - textWidth/2 - 5, labelY - 12, textWidth + 10, 24);
      
      // Texto
      ctx.fillStyle = '#fff';
      ctx.fillText(`${percentage}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Título
    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Top 10 Publicaciones', width / 2, 35);

    console.log('✅ Gráfico de top publicaciones COMPLETADO');
  }

  volver(): void {
    this.router.navigate(['/publicaciones']);
  }
}