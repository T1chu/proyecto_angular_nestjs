// frontend/src/app/components/publicacion-detalle/publicacion-detalle.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationsService } from '../../services/publications.service';
import { AuthService } from '../../services/auth.service';

interface Comentario {
  _id: string;
  mensaje: string;
  usuario: {
    _id: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    imagenPerfil?: string;
  };
  createdAt: Date;
  modificado: boolean;
}

interface PublicacionDetalle {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen?: string;
  usuario: {
    _id: string;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    imagenPerfil?: string;
  };
  meGusta: string[];
  createdAt: Date;
  totalComentarios: number;
}

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicacion-detalle.component.html',
  styleUrls: ['./publicacion-detalle.component.css']
})
export class PublicacionDetalleComponent implements OnInit {
  publicacionId: string = '';
  publicacion: PublicacionDetalle | null = null;
  comentarios: Comentario[] = [];
  totalComentarios: number = 0;
  offset: number = 0;
  limit: number = 10;
  hayMasComentarios: boolean = true;
  
  nuevoComentario: string = '';
  cargandoPublicacion: boolean = true;
  cargandoComentarios: boolean = false;
  enviandoComentario: boolean = false;
  
  editandoComentarioId: string | null = null;
  textoEditado: string = '';
  
  usuarioActualId: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicationsService: PublicationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.publicacionId = id;
    }
    
    const usuario = this.authService.getUsuarioActual();
    if (usuario) {
      this.usuarioActualId = usuario._id;
    }
    
    if (this.publicacionId) {
      this.cargarPublicacion();
      this.cargarComentarios();
    }
  }

  cargarPublicacion(): void {
    this.cargandoPublicacion = true;
    this.publicationsService.obtenerPorId(this.publicacionId).subscribe({
      next: (pub: any) => {
        this.publicacion = pub;
        this.totalComentarios = pub.totalComentarios || 0;
        this.cargandoPublicacion = false;
      },
      error: (err: any) => {
        console.error('Error cargando publicación:', err);
        this.cargandoPublicacion = false;
        alert('Error al cargar la publicación');
        this.router.navigate(['/publicaciones']);
      }
    });
  }

  cargarComentarios(): void {
    this.cargandoComentarios = true;
    this.publicationsService.obtenerComentarios(this.publicacionId, this.offset, this.limit).subscribe({
      next: (response: any) => {
        if (response.comentarios) {
          this.comentarios = [...this.comentarios, ...response.comentarios];
          this.hayMasComentarios = (this.offset + this.limit) < response.total;
        }
        this.cargandoComentarios = false;
      },
      error: (err: any) => {
        console.error('Error cargando comentarios:', err);
        this.cargandoComentarios = false;
      }
    });
  }

  cargarMasComentarios(): void {
    if (!this.cargandoComentarios && this.hayMasComentarios) {
      this.offset += this.limit;
      this.cargarComentarios();
    }
  }

  enviarComentario(): void {
    if (!this.nuevoComentario.trim()) {
      return;
    }
    
    this.enviandoComentario = true;
    this.publicationsService.crearComentario(this.publicacionId, { mensaje: this.nuevoComentario }).subscribe({
      next: (comentario: any) => {
        this.comentarios.unshift(comentario);
        this.totalComentarios++;
        this.nuevoComentario = '';
        this.enviandoComentario = false;
      },
      error: (err: any) => {
        console.error('Error enviando comentario:', err);
        alert(err.error?.message || 'Error al enviar el comentario');
        this.enviandoComentario = false;
      }
    });
  }

  iniciarEdicion(comentario: Comentario): void {
    this.editandoComentarioId = comentario._id;
    this.textoEditado = comentario.mensaje;
  }

  cancelarEdicion(): void {
    this.editandoComentarioId = null;
    this.textoEditado = '';
  }

  guardarEdicion(comentarioId: string): void {
    if (!this.textoEditado.trim()) {
      return;
    }
    
    this.publicationsService.modificarComentario(this.publicacionId, comentarioId, { mensaje: this.textoEditado }).subscribe({
      next: (comentarioActualizado: any) => {
        const index = this.comentarios.findIndex(c => c._id === comentarioId);
        if (index !== -1) {
          this.comentarios[index] = comentarioActualizado;
        }
        this.cancelarEdicion();
      },
      error: (err: any) => {
        console.error('Error editando comentario:', err);
        alert(err.error?.message || 'Error al editar el comentario');
      }
    });
  }

  puedeEditarComentario(comentario: Comentario): boolean {
    return comentario.usuario._id === this.usuarioActualId;
  }

  eliminarComentario(comentarioId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      return;
    }

    this.publicationsService.eliminarComentario(this.publicacionId, comentarioId).subscribe({
      next: () => {
        // Eliminar el comentario de la lista local
        const index = this.comentarios.findIndex(c => c._id === comentarioId);
        if (index !== -1) {
          this.comentarios.splice(index, 1);
          this.totalComentarios--;
        }
      },
      error: (err: any) => {
        console.error('Error eliminando comentario:', err);
        alert(err.error?.message || 'Error al eliminar el comentario');
      }
    });
  }

  yaDioMeGusta(): boolean {
    if (!this.usuarioActualId || !this.publicacion) {
      return false;
    }
    return this.publicacion.meGusta?.includes(this.usuarioActualId) || false;
  }

  toggleMeGusta(): void {
    if (this.yaDioMeGusta()) {
      this.quitarMeGusta();
    } else {
      this.darMeGusta();
    }
  }

  darMeGusta(): void {
    this.publicationsService.darMeGusta(this.publicacionId).subscribe({
      next: (pubActualizada: any) => {
        if (this.publicacion) {
          this.publicacion.meGusta = pubActualizada.meGusta || [];
        }
      },
      error: (err: any) => {
        console.error('Error al dar me gusta:', err);
      }
    });
  }

  quitarMeGusta(): void {
    this.publicationsService.quitarMeGusta(this.publicacionId).subscribe({
      next: (pubActualizada: any) => {
        if (this.publicacion) {
          this.publicacion.meGusta = pubActualizada.meGusta || [];
        }
      },
      error: (err: any) => {
        console.error('Error al quitar me gusta:', err);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/publicaciones']);
  }
}