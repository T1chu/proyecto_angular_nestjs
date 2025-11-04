// src/app/components/modal-crear-publicacion/modal-crear-publicacion.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicationsService } from '../../services/publications.service';

@Component({
  selector: 'app-modal-crear-publicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-crear-publicacion.component.html',
  styleUrls: ['./modal-crear-publicacion.component.css']
})
export class ModalCrearPublicacionComponent {
  @Output() cerrar = new EventEmitter<void>();
  @Output() publicacionCreada = new EventEmitter<void>();

  titulo: string = '';
  mensaje: string = '';
  imagenSeleccionada: File | null = null;
  previsualizacionImagen: string | null = null;
  enviando: boolean = false;
  error: string = '';

  constructor(private publicationsService: PublicationsService) {}

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      
      // Validar tipo de archivo
      if (!archivo.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
        this.error = 'Solo se permiten imágenes (JPG, PNG, GIF)';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no debe superar 5MB';
        return;
      }

      this.imagenSeleccionada = archivo;
      this.error = '';

      // Crear previsualización
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previsualizacionImagen = e.target?.result as string;
      };
      reader.readAsDataURL(archivo);
    }
  }

  eliminarImagen(): void {
    this.imagenSeleccionada = null;
    this.previsualizacionImagen = null;
  }

  async crear(): Promise<void> {
    if (!this.titulo.trim()) {
      this.error = 'El título es obligatorio';
      return;
    }

    if (!this.mensaje.trim()) {
      this.error = 'El mensaje es obligatorio';
      return;
    }

    this.enviando = true;
    this.error = '';

    try {
      const formData = new FormData();
      formData.append('titulo', this.titulo);
      formData.append('mensaje', this.mensaje);
      
      if (this.imagenSeleccionada) {
        formData.append('imagen', this.imagenSeleccionada);
      }

      await this.publicationsService.crear(formData);
      this.publicacionCreada.emit();
      this.cerrarModal();
    } catch (err: any) {
      this.error = err.error?.message || 'Error al crear la publicación';
      this.enviando = false;
    }
  }

  cerrarModal(): void {
    this.titulo = '';
    this.mensaje = '';
    this.imagenSeleccionada = null;
    this.previsualizacionImagen = null;
    this.error = '';
    this.enviando = false;
    this.cerrar.emit();
  }
}
