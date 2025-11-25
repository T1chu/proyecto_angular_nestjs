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
  imagenPreview: string | null = null; // Para preview
  error: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    console.log('📁 Input file cambió:', input.files?.length);
    
    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      
      console.log('📷 Archivo seleccionado:', {
        nombre: archivo.name,
        tipo: archivo.type,
        tamaño: archivo.size,
      });
      
      // Validar tipo de archivo
      if (!archivo.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
        this.error = 'Solo se permiten imágenes (JPG, PNG, GIF)';
        this.imagenPerfil = null;
        this.imagenPreview = null;
        input.value = '';
        console.log('❌ Tipo de archivo inválido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no debe superar 5MB';
        this.imagenPerfil = null;
        this.imagenPreview = null;
        input.value = '';
        console.log('❌ Archivo muy grande');
        return;
      }

      this.imagenPerfil = archivo;
      this.error = '';
      console.log('✅ Imagen válida guardada');

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
        console.log('✅ Preview generado');
      };
      reader.readAsDataURL(archivo);
    }
  }

  eliminarImagen(): void {
    this.imagenPerfil = null;
    this.imagenPreview = null;
    const input = document.getElementById('imagenPerfil') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
    console.log('🗑️ Imagen eliminada');
  }

  onSubmit() {
    // Limpiar error previo
    this.error = '';

    console.log('📝 Iniciando validación del formulario...');

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
      console.log('❌ Faltan campos obligatorios');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.contrasena !== this.confirmarContrasena) {
      this.error = 'Las contraseñas no coinciden';
      console.log('❌ Contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (this.contrasena.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      console.log('❌ Contraseña muy corta');
      return;
    }

    // Validar formato de contraseña (mayúscula y número)
    if (!/^(?=.*[A-Z])(?=.*\d)/.test(this.contrasena)) {
      this.error = 'La contraseña debe contener al menos una mayúscula y un número';
      console.log('❌ Contraseña sin mayúscula o número');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      this.error = 'Ingresa un correo electrónico válido';
      console.log('❌ Correo inválido');
      return;
    }

    console.log('✅ Validaciones pasadas, creando FormData...');

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
      formData.append('imagenPerfil', this.imagenPerfil, this.imagenPerfil.name);
      console.log('📷 Imagen añadida al FormData:', this.imagenPerfil.name);
    } else {
      console.log('⚠️ Sin imagen de perfil');
    }

    // Log del FormData
    console.log('📦 FormData preparado:');
    for (let pair of (formData as any).entries()) {
      if (pair[0] === 'imagenPerfil') {
        console.log(`  ${pair[0]}: [File] ${pair[1].name}`);
      } else if (pair[0] === 'contrasena') {
        console.log(`  ${pair[0]}: ***`);
      } else {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }

    console.log('🚀 Enviando petición al backend...');

    this.authService.registro(formData).subscribe({
      next: (respuesta) => {
        console.log('✅ Respuesta del servidor:', respuesta);
        alert('¡Registro exitoso! Ahora puedes iniciar sesión');
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('❌ Error del servidor:', error);
        this.error = error.error?.message || error.message || 'Error en el registro';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
        console.log('✅ Petición completada');
      }
    });
  }
}