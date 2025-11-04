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
  error: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
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

    if (this.contrasena !== this.confirmarContrasena) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.contrasena.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d)/.test(this.contrasena)) {
      this.error = 'La contraseña debe contener al menos una mayúscula y un número';
      return;
    }

    this.cargando = true;
    this.error = '';

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

    this.authService.registro(formData).subscribe({
      next: () => {
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