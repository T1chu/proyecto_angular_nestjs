// frontend/src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService, Usuario } from './auth.service';

export interface UsuarioExtendido extends Usuario {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Estadistica {
  publicacionesPorUsuario: any[];
  comentariosPorPeriodo: any[];
  comentariosPorPublicacion: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Gestión de usuarios
  listarUsuarios(): Observable<UsuarioExtendido[]> {
    return this.http.get<UsuarioExtendido[]>(`${this.apiUrl}/usuarios`, {
      headers: this.getHeaders()
    });
  }

  crearUsuario(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, formData, {
      headers: this.getHeaders()
    });
  }

  deshabilitarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`, {
      headers: this.getHeaders()
    });
  }

  habilitarUsuario(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/${id}/habilitar`, {}, {
      headers: this.getHeaders()
    });
  }

// Estadísticas
obtenerPublicacionesPorUsuario(fechaInicio: string, fechaFin: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/estadisticas/publicaciones-por-usuario?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    { headers: this.getHeaders() }
  ).pipe(
    tap((datos) => {
      console.log("🔍 [BACK] Publicaciones por usuario (datos crudos):", datos);
    })
  );
}

obtenerComentariosPorPeriodo(fechaInicio: string, fechaFin: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/estadisticas/comentarios-por-periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    { headers: this.getHeaders() }
  ).pipe(
    tap((datos) => {
      console.log("🔍 [BACK] Comentarios por período (datos crudos):", datos);
    })
  );
}

obtenerComentariosPorPublicacion(fechaInicio: string, fechaFin: string): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.apiUrl}/estadisticas/comentarios-por-publicacion?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    { headers: this.getHeaders() }
  ).pipe(
    tap((datos) => {
      console.log("🔍 [BACK] Comentarios por publicación (datos crudos):", datos);
    })
  );
}
}

