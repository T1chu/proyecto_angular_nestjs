import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicationsService, Publicacion } from '../../services/publications.service';
import { PublicacionItemComponent } from '../publicacion-item/publicacion-item.component';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, PublicacionItemComponent],
  templateUrl: './publicaciones.component.html'
})
export class PublicacionesComponent implements OnInit {
  publicaciones: Publicacion[] = [];
  loading = false;

  constructor(private publicationsService: PublicationsService) {}

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.loading = true;
    this.publicationsService.listar().subscribe({
      next: (pubs) => {
        this.publicaciones = pubs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando publicaciones:', err);
        this.loading = false;
      }
    });
  }

  onPublicacionCreada(): void {
    this.cargarPublicaciones();
  }
}
