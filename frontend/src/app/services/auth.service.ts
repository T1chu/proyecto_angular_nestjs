// frontend/src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
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
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface RegistroResponse {
  mensaje: string;
  usuario: Usuario;
}

export interface ValidarTokenResponse {
  valido: boolean;
  usuario?: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioActual.asObservable();
  private inicializado = false;

  constructor(private http: HttpClient) {
    // No llamar a cargarUsuarioDesdeToken aquí para evitar dependencia circular
  }

  // Método público para inicializar el servicio
  inicializar(): void {
    if (!this.inicializado) {
      this.inicializado = true;
      this.cargarUsuarioDesdeToken();
    }
  }

  registro(formData: FormData): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.apiUrl}/auth/registro`, formData);
  }

  login(usuarioOCorreo: string, contrasena: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      usuarioOCorreo,
      contrasena
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('loginTime', Date.now().toString());
        this.usuarioActual.next(response.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('loginTime');
    this.usuarioActual.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getLoginTime(): number | null {
    const time = localStorage.getItem('loginTime');
    return time ? parseInt(time, 10) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioActual.value;
  }

  async validarToken(token: string): Promise<ValidarTokenResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<ValidarTokenResponse>(`${this.apiUrl}/auth/autorizar`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      return response;
    } catch (error) {
      console.error('Error al validar token:', error);
      return { valido: false };
    }
  }

  private async cargarUsuarioDesdeToken(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        const response = await firstValueFrom(
          this.http.post<any>(`${this.apiUrl}/auth/autorizar`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        );
        
        if (response?.usuario) {
          this.usuarioActual.next(response.usuario);
        }
      } catch (error) {
        console.error('Error al cargar usuario desde token:', error);
        this.logout();
      }
    }
  }

  async refrescarToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/refrescar`, {}, {
          headers: { 'Authorization': `Bearer ${refreshToken}` }
        })
      );

      if (response) {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('loginTime', Date.now().toString());
        this.usuarioActual.next(response.usuario);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      this.logout();
      return false;
    }
  }
}