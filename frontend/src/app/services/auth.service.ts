// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: Date;
  descripcion?: string;
  imagenPerfil?: string;
  perfil: string;
  activo: boolean;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioActual.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuarioDesdeToken();
  }

  registro(formData: FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/registro`, formData).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.usuarioActual.next(response.usuario);
      })
    );
  }

  login(usuarioOCorreo: string, contrasena: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      usuarioOCorreo,
      contrasena
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.usuarioActual.next(response.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.usuarioActual.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioActual.value;
  }

  private cargarUsuarioDesdeToken(): void {
    const token = this.getToken();
    if (token) {
      // Aquí podrías decodificar el token y extraer la info del usuario
      // Por simplicidad, haremos una llamada a /auth/autorizar cuando sea necesario
    }
  }
}
