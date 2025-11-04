// frontend/src/app/components/mi-perfil/mi-perfil.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css'],
})
export class MiPerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  editando: boolean = false;
  cargando: boolean = false;
  error: string = '';
  
  // Campos editables
  nombre: string = '';
  apellido: string = '';
  descripcion: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.usuario = usuario;
        this.nombre = usuario.nombre;
        this.apellido = usuario.apellido || '';
        this.descripcion = usuario.descripcion || '';
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleEdicion() {
    if (this.editando) {
      // Cancelar edición, restaurar valores originales
      if (this.usuario) {
        this.nombre = this.usuario.nombre;
        this.apellido = this.usuario.apellido || '';
        this.descripcion = this.usuario.descripcion || '';
      }
    }
    this.editando = !this.editando;
    this.error = '';
  }

  guardarCambios() {
    if (!this.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    this.cargando = true;
    this.error = '';

    // Aquí se implementaría la llamada al servicio para actualizar el perfil
    // Por ahora simularemos la actualización
    setTimeout(() => {
      if (this.usuario) {
        this.usuario.nombre = this.nombre;
        this.usuario.apellido = this.apellido;
        this.usuario.descripcion = this.descripcion;
      }
      this.editando = false;
      this.cargando = false;
    }, 1000);
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}