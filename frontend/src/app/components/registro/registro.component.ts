// frontend/src/app/components/registro/registro.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent {
  nombre: string = '';
  apellido: string = '';
  usuario: string = '';
  correo: string = '';
  contrasena: string = '';
  confirmarContrasena: string = '';
  fechaNacimiento: string = '';
  descripcion: string = '';
  imagenPerfil: File | null = null;
  error: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      
      // Validar tipo de archivo
      if (!archivo.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
        this.error = 'Solo se permiten imágenes (JPG, PNG, GIF)';
        this.imagenPerfil = null;
        input.value = '';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no debe superar 5MB';
        this.imagenPerfil = null;
        input.value = '';
        return;
      }

      this.imagenPerfil = archivo;
      this.error = '';
    }
  }

  onSubmit() {
    // Limpiar error previo
    this.error = '';

    // Validar campos obligatorios
    if (
      !this.nombre ||
      !this.apellido ||
      !this.usuario ||
      !this.correo ||
      !this.contrasena ||
      !this.confirmarContrasena ||
      !this.fechaNacimiento
    ) {
      this.error = 'Por favor completa todos los campos obligatorios';
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.contrasena !== this.confirmarContrasena) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    // Validar longitud de contraseña
    if (this.contrasena.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    // Validar formato de contraseña (mayúscula y número)
    if (!/^(?=.*[A-Z])(?=.*\d)/.test(this.contrasena)) {
      this.error = 'La contraseña debe contener al menos una mayúscula y un número';
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      this.error = 'Ingresa un correo electrónico válido';
      return;
    }

    this.cargando = true;

    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('apellido', this.apellido);
    formData.append('nombreUsuario', this.usuario);
    formData.append('correo', this.correo);
    formData.append('contrasena', this.contrasena);
    formData.append('fechaNacimiento', this.fechaNacimiento);
    if (this.descripcion) {
      formData.append('descripcion', this.descripcion);
    }
    if (this.imagenPerfil) {
      formData.append('imagenPerfil', this.imagenPerfil);
    }

    this.authService.registro(formData).subscribe({
      next: () => {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión');
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.error = error.error?.message || 'Error en el registro';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }
}