// frontend/src/app/components/publicaciones/publicaciones.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicationsService } from '../../services/publications.service';
import { AuthService } from '../../services/auth.service';
import { ModalCrearPublicacionComponent } from '../modal-crear-publicacion/modal-crear-publicacion.component';

interface PublicacionConUsuario {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen?: string;
  usuario?: {
    _id: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    imagenPerfil?: string;
  };
  meGusta: string[];
  activo: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalCrearPublicacionComponent],
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.css']
})
export class PublicacionesComponent implements OnInit {
  publicaciones: PublicacionConUsuario[] = [];
  loading = false;
  mostrarModal = false;
  ordenamiento = 'fecha';
  offset = 0;
  limit = 10;
  total = 0;
  Math = Math;
  usuarioActualId: string | null = null;
  perfilUsuario: string | null = null;

  constructor(
    private publicationsService: PublicationsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener información del usuario actual
    const usuario = this.authService.getUsuarioActual();
    if (usuario) {
      this.usuarioActualId = usuario._id;
      this.perfilUsuario = usuario.perfil;
    }

    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.loading = true;
    this.publicationsService.listar(this.ordenamiento, this.offset, this.limit).subscribe({
      next: (publicaciones) => {
        // Asegurarse de que publicaciones sea un array
        if (Array.isArray(publicaciones)) {
          this.publicaciones = publicaciones;
          this.total = publicaciones.length;
        } else {
          console.error('La respuesta no es un array:', publicaciones);
          this.publicaciones = [];
          this.total = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando publicaciones:', err);
        this.publicaciones = [];
        this.total = 0;
        this.loading = false;
        
        // Si el error es de autenticación, redirigir al login
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
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
    this.offset = 0; // Volver a la primera página
    this.cargarPublicaciones();
  }

  toggleMeGusta(publicacion: PublicacionConUsuario): void {
    if (this.yaDioMeGusta(publicacion)) {
      this.quitarMeGusta(publicacion);
    } else {
      this.darMeGusta(publicacion);
    }
  }

  darMeGusta(publicacion: PublicacionConUsuario): void {
    this.publicationsService.darMeGusta(publicacion._id).subscribe({
      next: (pubActualizada: any) => {
        // Actualizar la publicación en la lista
        const index = this.publicaciones.findIndex(p => p._id === publicacion._id);
        if (index !== -1) {
          this.publicaciones[index].meGusta = pubActualizada.meGusta || [];
        }
      },
      error: (err) => {
        console.error('Error al dar me gusta:', err);
        alert(err.error?.message || 'Error al dar me gusta');
      }
    });
  }

  quitarMeGusta(publicacion: PublicacionConUsuario): void {
    this.publicationsService.quitarMeGusta(publicacion._id).subscribe({
      next: (pubActualizada: any) => {
        // Actualizar la publicación en la lista
        const index = this.publicaciones.findIndex(p => p._id === publicacion._id);
        if (index !== -1) {
          this.publicaciones[index].meGusta = pubActualizada.meGusta || [];
        }
      },
      error: (err) => {
        console.error('Error al quitar me gusta:', err);
        alert(err.error?.message || 'Error al quitar me gusta');
      }
    });
  }

  yaDioMeGusta(publicacion: PublicacionConUsuario): boolean {
    if (!this.usuarioActualId) return false;
    return publicacion.meGusta?.includes(this.usuarioActualId) || false;
  }

  puedeEliminar(publicacion: PublicacionConUsuario): boolean {
    if (!this.usuarioActualId) return false;
    // Puede eliminar si es el creador o es administrador
    return publicacion.usuario?._id === this.usuarioActualId || 
           this.perfilUsuario === 'administrador';
  }

  eliminarPublicacion(id: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    this.publicationsService.eliminar(id).subscribe({
      next: () => {
        // Recargar publicaciones
        this.cargarPublicaciones();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert(err.error?.message || 'Error al eliminar la publicación');
      }
    });
  }

  irAPerfil(): void {
    this.router.navigate(['/mi-perfil']);
  }

  paginaAnterior(): void {
    if (this.offset > 0) {
      this.offset = Math.max(0, this.offset - this.limit);
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