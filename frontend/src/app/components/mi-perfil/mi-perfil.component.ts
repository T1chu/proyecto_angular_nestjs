import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  mensajeExito: string = '';
  
  // Campos editables
  nombre: string = '';
  apellido: string = '';
  descripcion: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
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

  async cambiarFotoPerfil(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const archivo = input.files[0];

    // Validar tipo de archivo
    if (!archivo.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
      this.error = 'Solo se permiten imágenes (JPG, PNG, GIF)';
      setTimeout(() => this.error = '', 3000);
      input.value = '';
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      this.error = 'La imagen no debe superar 5MB';
      setTimeout(() => this.error = '', 3000);
      input.value = '';
      return;
    }

    this.cargando = true;
    this.error = '';

    const formData = new FormData();
    formData.append('imagenPerfil', archivo);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    try {
      const response = await this.http.put<any>(
        `${environment.apiUrl}/usuarios/perfil/imagen`,
        formData,
        { headers }
      ).toPromise();

      if (response && this.usuario) {
        this.usuario.imagenPerfil = response.imagenPerfil;
        // Mostrar mensaje de éxito temporal
        this.mensajeExito = '✓ Foto de perfil actualizada correctamente';
        setTimeout(() => this.mensajeExito = '', 3000);
        this.error = '';
      }
    } catch (error: any) {
      console.error('Error al cambiar foto:', error);
      this.error = error.error?.message || 'Error al cambiar la foto de perfil';
      setTimeout(() => this.error = '', 3000);
    } finally {
      this.cargando = false;
      input.value = '';
    }
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
    this.mensajeExito = '';
  }

  guardarCambios() {
    if (!this.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensajeExito = '';

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const datos = {
      nombre: this.nombre,
      apellido: this.apellido,
      descripcion: this.descripcion
    };

    this.http.put<any>(
      `${environment.apiUrl}/usuarios/perfil`,
      datos,
      { headers }
    ).subscribe({
      next: (response) => {
        if (this.usuario) {
          this.usuario.nombre = response.nombre;
          this.usuario.apellido = response.apellido;
          this.usuario.descripcion = response.descripcion;
        }
        this.editando = false;
        this.cargando = false;
        this.mensajeExito = '✓ Perfil actualizado correctamente';
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al actualizar el perfil';
        this.cargando = false;
      }
    });
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}