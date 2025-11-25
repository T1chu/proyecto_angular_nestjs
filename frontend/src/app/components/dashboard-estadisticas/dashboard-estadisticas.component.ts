// frontend/src/app/components/dashboard-estadisticas/dashboard-estadisticas.component.ts - VERSIÓN FINAL
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { LoadingSpinnerDirective } from '../../directives/loading-spinner.directive';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerDirective],
  templateUrl: './dashboard-estadisticas.component.html',
  styleUrls: ['./dashboard-estadisticas.component.css'],
  changeDetection: ChangeDetectionStrategy.Default // 🔥 FORZAR estrategia Default
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
  
  // 🔥 Campos calculados para las estadísticas
  totalPublicaciones: number = 0;
  totalComentarios: number = 0;
  usuariosActivos: number = 0;
  topPublicacionComentarios: number = 0;
  
  // 🔥 Observables para forzar actualización con async pipe
  totalPublicaciones$ = new BehaviorSubject<number>(0);
  totalComentarios$ = new BehaviorSubject<number>(0);
  usuariosActivos$ = new BehaviorSubject<number>(0);
  topPublicacionComentarios$ = new BehaviorSubject<number>(0);
  
  cargandoPublicaciones: boolean = false;
  cargandoComentarios: boolean = false;
  cargandoComentariosPublicacion: boolean = false;
  
  // 🔥 Contador público para forzar re-render
  renderKey: number = 0;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
    this.totalComentarios = total;
    this.totalComentarios$.next(total);
    return total;
  }

  getTotalPublicaciones(): number {
    const total = this.publicacionesPorUsuario.reduce((sum, d) => sum + d.cantidad, 0);
    this.totalPublicaciones = total;
    this.totalPublicaciones$.next(total);
    return total;
  }

  getUsuariosActivos(): number {
    const total = this.publicacionesPorUsuario.length;
    this.usuariosActivos = total;
    this.usuariosActivos$.next(total);
    return total;
  }

  getTopPublicacionComentarios(): number {
    if (this.comentariosPorPublicacion.length === 0) return 0;
    const top = this.comentariosPorPublicacion[0]?.cantidad || 0;
    this.topPublicacionComentarios = top;
    this.topPublicacionComentarios$.next(top);
    return top;
  }

  cargarTodasEstadisticas(): void {
  console.log('\n🔄 === BOTÓN ACTUALIZAR PRESIONADO ===');
  console.log('Fechas:', { inicio: this.fechaInicio, fin: this.fechaFin });
  
  // 1) Limpiar datos actuales
  this.publicacionesPorUsuario = [];
  this.comentariosPorPeriodo = [];
  this.comentariosPorPublicacion = [];

  // 2) Resetear estadísticas
  this.totalPublicaciones = 0;
  this.totalComentarios = 0;
  this.usuariosActivos = 0;
  this.topPublicacionComentarios = 0;

  // 3) Resetear BehaviorSubjects (por si los usás en otro lado)
  this.totalPublicaciones$.next(0);
  this.totalComentarios$.next(0);
  this.usuariosActivos$.next(0);
  this.topPublicacionComentarios$.next(0);

  // 4) Limpiar los gráficos (canvas)
  this.limpiarGraficos();

  console.log('📊 Estadísticas limpiadas, cargando nuevos datos...');

  // 5) Volver a pedir los datos al back
  this.cargarPublicacionesPorUsuario();
  this.cargarComentariosPorPeriodo();
  this.cargarComentariosPorPublicacion();
}


  cargarPublicacionesPorUsuario(): void {
    console.log('\n📊 [1/3] Cargando publicaciones por usuario...');
    
    this.cargandoPublicaciones = true;
    
    this.adminService.obtenerPublicacionesPorUsuario(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Publicaciones recibidas:', datos);
        
        
        // 🔥 Agrupar por nombre de usuario (sumar cantidades)
        const map = new Map();
        datos.forEach(d => {
          const key = d.nombreUsuario;
          if (!map.has(key)) map.set(key, { nombreUsuario: key, cantidad: 0 });
          map.get(key).cantidad += d.cantidad;
        });
        this.publicacionesPorUsuario = Array.from(map.values());

        this.cargandoPublicaciones = false;
        
        // Actualizar estadísticas
        this.getTotalPublicaciones();
        this.getUsuariosActivos();
        
        this.cdr.detectChanges();
        
        if (this.publicacionesPorUsuario.length > 0) {
          setTimeout(() => {
            if (this.chartPublicacionesRef) {
              this.renderizarGraficoPublicaciones();
            }
          }, 200);
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
    console.log('\n💬 [2/3] Cargando comentarios por periodo...');
    
    this.cargandoComentarios = true;
    
    this.adminService.obtenerComentariosPorPeriodo(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Comentarios recibidos:', datos);
        
        this.comentariosPorPeriodo = datos || [];
        this.cargandoComentarios = false;
        
        // Actualizar estadísticas
        this.getTotalComentarios();
        
        this.cdr.detectChanges();
        
        if (this.comentariosPorPeriodo.length > 0) {
          setTimeout(() => {
            if (this.chartComentariosPeriodoRef) {
              this.renderizarGraficoComentariosPeriodo();
            }
          }, 200);
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
    console.log('\n📊 [3/3] Cargando comentarios por publicación...');
    
    this.cargandoComentariosPublicacion = true;
    
    this.adminService.obtenerComentariosPorPublicacion(this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        console.log('✅ Top publicaciones recibidas:', datos);
        
        this.comentariosPorPublicacion = datos || [];
        this.cargandoComentariosPublicacion = false;
        
        // Actualizar estadísticas
        this.getTopPublicacionComentarios();
        
        this.cdr.detectChanges();
        
        if (this.comentariosPorPublicacion.length > 0) {
          setTimeout(() => {
            if (this.chartComentariosPublicacionRef) {
              this.renderizarGraficoComentariosPublicacion();
            }
          }, 200);
        }
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.cargandoComentariosPublicacion = false;
        this.comentariosPorPublicacion = [];
      }
    });
  }

  renderizarGraficoPublicaciones(): void {
    const canvas = this.chartPublicacionesRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 80;
    const barWidth = (width - 2 * padding) / Math.max(this.publicacionesPorUsuario.length, 1);

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const maxValue = Math.max(...this.publicacionesPorUsuario.map(d => d.cantidad), 1);

    this.publicacionesPorUsuario.forEach((dato, index) => {
      const barHeight = ((dato.cantidad / maxValue) * (height - 2 * padding));
      const x = padding + index * barWidth + barWidth * 0.1;
      const y = height - padding - barHeight;

      const gradient = ctx.createLinearGradient(x, y, x, height - padding);
      gradient.addColorStop(0, '#ff1744');
      gradient.addColorStop(1, '#dc143c');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dato.cantidad.toString(), x + barWidth * 0.4, y - 15);
      
      ctx.save();
      ctx.translate(x + barWidth * 0.4, height - padding + 25);
      ctx.rotate(-Math.PI / 6);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(dato.nombreUsuario.substring(0, 15), 0, 0);
      ctx.restore();
    });

    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Publicaciones por Usuario', width / 2, 35);

    ctx.strokeStyle = 'rgba(220, 20, 60, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);
  }

  renderizarGraficoComentariosPeriodo(): void {
    const canvas = this.chartComentariosPeriodoRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 80;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const maxValue = Math.max(...this.comentariosPorPeriodo.map(d => d.cantidad), 1);
    const stepX = (width - 2 * padding) / Math.max(this.comentariosPorPeriodo.length - 1, 1);

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

    this.comentariosPorPeriodo.forEach((dato, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((dato.cantidad / maxValue) * (height - 2 * padding));

      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dato.cantidad.toString(), x, y - 25);

      if (index % 2 === 0 || index === this.comentariosPorPeriodo.length - 1) {
        ctx.fillStyle = '#aaa';
        ctx.font = '12px sans-serif';
        const fecha = new Date(dato.fecha);
        const fechaTexto = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
        ctx.fillText(fechaTexto, x, height - padding + 30);
      }
    });

    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Comentarios por Periodo', width / 2, 35);

    ctx.strokeStyle = 'rgba(220, 20, 60, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);
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

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.stroke();

      const percentage = ((dato.cantidad / total) * 100).toFixed(1);
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.65);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.65);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textWidth = ctx.measureText(`${percentage}%`).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(labelX - textWidth/2 - 5, labelY - 12, textWidth + 10, 24);
      
      ctx.fillStyle = '#fff';
      ctx.fillText(`${percentage}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Top 10 Publicaciones', width / 2, 35);
  }


private limpiarGraficos(): void {
  this.limpiarCanvas(this.chartPublicacionesRef);
  this.limpiarCanvas(this.chartComentariosPeriodoRef);
  this.limpiarCanvas(this.chartComentariosPublicacionRef);
}

private limpiarCanvas(ref?: ElementRef<HTMLCanvasElement>): void {
  if (!ref) return;
  const canvas = ref.nativeElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}




  volver(): void {
    this.router.navigate(['/publicaciones']);
  }
}