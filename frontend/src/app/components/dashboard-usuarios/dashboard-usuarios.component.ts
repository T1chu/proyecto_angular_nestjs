// frontend/src/app/components/dashboard-usuarios/dashboard-usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, UsuarioExtendido } from '../../services/admin.service';
import { HighlightDirective } from '../../directives/highlight.directive';
import { TiempoTranscurridoPipe } from '../../pipes/tiempo-transcurrido.pipe';
import { NombreCompletoPipe } from '../../pipes/nombre-completo.pipe';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HighlightDirective,
    TiempoTranscurridoPipe,
    NombreCompletoPipe
  ],
  templateUrl: './dashboard-usuarios.component.html',
  styleUrls: ['./dashboard-usuarios.component.css']
})
export class DashboardUsuariosComponent implements OnInit {
  usuarios: UsuarioExtendido[] = [];
  usuariosFiltrados: UsuarioExtendido[] = [];
  cargando: boolean = true;
  mostrarFormulario: boolean = false;
  filtro: string = '';
  
  // Formulario
  nombre: string = '';
  apellido: string = '';
  nombreUsuario: string = '';
  correo: string = '';
  contrasena: string = '';
  confirmarContrasena: string = '';
  fechaNacimiento: string = '';
  descripcion: string = '';
  perfil: 'usuario' | 'administrador' = 'usuario';
  imagenPerfil: File | null = null;
  
  error: string = '';
  enviando: boolean = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.adminService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error = 'Error al cargar usuarios';
        this.cargando = false;
      }
    });
  }

  filtrarUsuarios(): void {
    const filtroLower = this.filtro.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(u =>
      u.nombre.toLowerCase().includes(filtroLower) ||
      u.apellido.toLowerCase().includes(filtroLower) ||
      u.nombreUsuario.toLowerCase().includes(filtroLower) ||
      u.correo.toLowerCase().includes(filtroLower)
    );
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limpiarFormulario();
    }
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imagenPerfil = input.files[0];
    }
  }

  crearUsuario(): void {
    if (this.contrasena !== this.confirmarContrasena) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.enviando = true;
    this.error = '';

    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('apellido', this.apellido);
    formData.append('nombreUsuario', this.nombreUsuario);
    formData.append('correo', this.correo);
    formData.append('contrasena', this.contrasena);
    formData.append('fechaNacimiento', this.fechaNacimiento);
    formData.append('perfil', this.perfil);
    
    if (this.descripcion) {
      formData.append('descripcion', this.descripcion);
    }
    
    if (this.imagenPerfil) {
      formData.append('imagenPerfil', this.imagenPerfil);
    }

    this.adminService.crearUsuario(formData).subscribe({
      next: () => {
        alert('Usuario creado exitosamente');
        this.toggleFormulario();
        this.cargarUsuarios();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al crear usuario';
        this.enviando = false;
      },
      complete: () => {
        this.enviando = false;
      }
    });
  }

  toggleEstadoUsuario(usuario: UsuarioExtendido): void {
    const accion = usuario.activo ? 'deshabilitar' : 'habilitar';
    
    if (!confirm(`¿Estás seguro de que deseas ${accion} a ${usuario.nombre}?`)) {
      return;
    }

    const operacion = usuario.activo
      ? this.adminService.deshabilitarUsuario(usuario._id)
      : this.adminService.habilitarUsuario(usuario._id);

    operacion.subscribe({
      next: () => {
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error(`Error al ${accion} usuario:`, error);
        alert(`Error al ${accion} usuario`);
      }
    });
  }

  limpiarFormulario(): void {
    this.nombre = '';
    this.apellido = '';
    this.nombreUsuario = '';
    this.correo = '';
    this.contrasena = '';
    this.confirmarContrasena = '';
    this.fechaNacimiento = '';
    this.descripcion = '';
    this.perfil = 'usuario';
    this.imagenPerfil = null;
    this.error = '';
  }

  volver(): void {
    this.router.navigate(['/publicaciones']);
  }
}