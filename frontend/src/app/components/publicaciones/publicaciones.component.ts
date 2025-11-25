// frontend/src/app/components/publicaciones/publicaciones.component.ts (ACTUALIZADO)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicationsService, Publicacion } from '../../services/publications.service';
import { AuthService } from '../../services/auth.service';
import { ModalCrearPublicacionComponent } from '../modal-crear-publicacion/modal-crear-publicacion.component';
import { RoleAccessDirective } from '../../directives/role-access.directive';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ModalCrearPublicacionComponent,
    RoleAccessDirective
  ],
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.css']
})
export class PublicacionesComponent implements OnInit {
  publicaciones: Publicacion[] = [];
  loading: boolean = true;
  mostrarModal: boolean = false;
  ordenamiento: string = 'fecha';
  offset: number = 0;
  limit: number = 10;
  total: number = 0;
  Math = Math;

  constructor(
    private publicationsService: PublicationsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.inicializar();
  }

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.loading = true;
    
    this.publicationsService.listar(this.ordenamiento, this.offset, this.limit).subscribe({
      next: (response: any) => {
        if (response && response.publicaciones) {
          this.publicaciones = response.publicaciones || [];
          this.total = response.total || 0;
        } else if (Array.isArray(response)) {
          this.publicaciones = response;
          this.total = response.length;
        } else {
          this.publicaciones = [];
          this.total = 0;
        }
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar publicaciones:', error);
        alert('Error al cargar publicaciones: ' + (error.error?.message || error.message || 'Error desconocido'));
        this.loading = false;
        this.publicaciones = [];
      }
    });
  }

  abrirModalCrear(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  onPublicacionCreada(): void {
    this.offset = 0;
    this.cargarPublicaciones();
  }

  verDetalle(id: string): void {
    this.router.navigate(['/publicaciones', id]);
  }

  irAPerfil(): void {
    this.router.navigate(['/mi-perfil']);
  }

  irADashboardUsuarios(): void {
    this.router.navigate(['/dashboard/usuarios']);
  }

  irADashboardEstadisticas(): void {
    this.router.navigate(['/dashboard/estadisticas']);
  }

  puedeEliminar(publicacion: Publicacion): boolean {
    const usuarioActual = this.authService.getUsuarioActual();
    if (!usuarioActual || !publicacion || !publicacion.usuario) {
      return false;
    }
    // Puede eliminar si es su publicación O si es administrador
    return usuarioActual._id === publicacion.usuario._id || 
           usuarioActual.perfil === 'administrador';
  }

  eliminarPublicacion(id: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      return;
    }

    this.publicationsService.eliminar(id).subscribe({
      next: () => {
        this.cargarPublicaciones();
      },
      error: (error: any) => {
        console.error('❌ Error al eliminar publicación:', error);
        alert('Error al eliminar la publicación');
      }
    });
  }

  yaDioMeGusta(publicacion: Publicacion): boolean {
  const usuarioActual = this.authService.getUsuarioActual();
  if (!usuarioActual || !publicacion || !publicacion.meGusta) {
    return false;
  }
  
  const usuarioIdString = String(usuarioActual._id);
  const resultado = publicacion.meGusta.some(id => String(id) === usuarioIdString);
  
  console.log('🔍 Verificando me gusta:', {
    usuarioId: usuarioIdString,
    meGusta: publicacion.meGusta,
    yaDioMeGusta: resultado
  });
  
  return resultado;
}

toggleMeGusta(publicacion: Publicacion): void {
  if (!publicacion) return;
  
  console.log('💗 Toggle me gusta en publicación:', publicacion._id);
  console.log('❤️ Ya dio me gusta:', this.yaDioMeGusta(publicacion));
  
  if (this.yaDioMeGusta(publicacion)) {
    console.log('➡️ Quitando me gusta...');
    this.quitarMeGusta(publicacion);
  } else {
    console.log('➡️ Dando me gusta...');
    this.darMeGusta(publicacion);
  }
}

darMeGusta(publicacion: Publicacion): void {
  if (!publicacion || !publicacion._id) return;
  
  console.log('❤️ Dando me gusta a:', publicacion._id);
  
  this.publicationsService.darMeGusta(publicacion._id).subscribe({
    next: (pubActualizada: Publicacion) => {
      console.log('✅ Me gusta agregado. Nuevos me gustas:', pubActualizada.meGusta);
      const index = this.publicaciones.findIndex(p => p._id === publicacion._id);
      if (index !== -1 && pubActualizada && pubActualizada.meGusta) {
        this.publicaciones[index].meGusta = pubActualizada.meGusta;
        console.log('✅ Lista actualizada en componente');
      }
    },
    error: (error: any) => {
      console.error('❌ Error al dar me gusta:', error);
      alert(error.error?.message || 'Error al dar me gusta');
    }
  });
}

quitarMeGusta(publicacion: Publicacion): void {
  if (!publicacion || !publicacion._id) return;
  
  console.log('💔 Quitando me gusta de:', publicacion._id);
  
  this.publicationsService.quitarMeGusta(publicacion._id).subscribe({
    next: (pubActualizada: Publicacion) => {
      console.log('✅ Me gusta quitado. Nuevos me gustas:', pubActualizada.meGusta);
      const index = this.publicaciones.findIndex(p => p._id === publicacion._id);
      if (index !== -1 && pubActualizada && pubActualizada.meGusta) {
        this.publicaciones[index].meGusta = pubActualizada.meGusta;
        console.log('✅ Lista actualizada en componente');
      }
    },
    error: (error: any) => {
      console.error('❌ Error al quitar me gusta:', error);
      alert(error.error?.message || 'Error al quitar me gusta');
    }
  });
}

  paginaAnterior(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.cargarPublicaciones();
    }
  }

  paginaSiguiente(): void {
    if (this.offset + this.limit < this.total) {
      this.offset += this.limit;
      this.cargarPublicaciones();
    }
  }
}