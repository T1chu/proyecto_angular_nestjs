// frontend/src/app/services/publications.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen?: string;
  usuario: any;
  meGusta: string[];
  activo: boolean;
  createdAt: Date;
}

export interface ListarPublicacionesResponse {
  publicaciones: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export interface ComentariosResponse {
  comentarios: any[];
  total: number;
  offset: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class PublicationsService {
  private apiUrl = `${environment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  crear(formData: FormData): Promise<Publicacion> {
    return new Promise((resolve, reject) => {
      this.http.post<Publicacion>(this.apiUrl, formData, {
        headers: this.getHeaders()
      }).subscribe({
        next: resolve,
        error: reject
      });
    });
  }

  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  listar(ordenamiento: string = 'fecha', offset: number = 0, limit: number = 10): Observable<Publicacion[]> {
    let params = new HttpParams()
      .set('ordenamiento', ordenamiento)
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<ListarPublicacionesResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      map(response => {
        if (response && response.publicaciones) {
          return response.publicaciones;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  eliminar(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  darMeGusta(id: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.apiUrl}/${id}/megusta`, {}, {
      headers: this.getHeaders()
    });
  }

  quitarMeGusta(id: string): Observable<Publicacion> {
    return this.http.delete<Publicacion>(`${this.apiUrl}/${id}/megusta`, {
      headers: this.getHeaders()
    });
  }

  obtenerComentarios(publicacionId: string, offset: number, limit: number): Observable<ComentariosResponse> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<ComentariosResponse>(`${this.apiUrl}/${publicacionId}/comentarios`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  crearComentario(publicacionId: string, datos: { mensaje: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${publicacionId}/comentarios`, datos, {
      headers: this.getHeaders()
    });
  }

  modificarComentario(publicacionId: string, comentarioId: string, datos: { mensaje: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${publicacionId}/comentarios/${comentarioId}`, datos, {
      headers: this.getHeaders()
    });
  }
}