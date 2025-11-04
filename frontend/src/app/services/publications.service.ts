// src/app/services/publications.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Publicacion {
  _id: string;
  descripcion: string;
  fechaPublicacion: Date;
  usuarioId: string;
  megusta: string[];
  archivo?: string;
}

export interface CreatePublicacionDto {
  descripcion: string;
  archivo?: File;
}

@Injectable({
  providedIn: 'root'
})
export class PublicationsService {
  private apiUrl = `${environment.apiUrl}/publicaciones`;

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

  crear(formData: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.apiUrl}/crear`, formData, {
      headers: this.getHeaders()
    });
  }

  listar(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.apiUrl}/listar`, {
      headers: this.getHeaders()
    });
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/eliminar`, {
      headers: this.getHeaders()
    });
  }

  darMeGusta(id: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.apiUrl}/${id}/me-gusta`, {}, {
      headers: this.getHeaders()
    });
  }

  quitarMeGusta(id: string): Observable<Publicacion> {
    return this.http.delete<Publicacion>(`${this.apiUrl}/${id}/me-gusta`, {
      headers: this.getHeaders()
    });
  }
}
