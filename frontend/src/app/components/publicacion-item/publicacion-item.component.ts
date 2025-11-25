import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../services/publications.service';

@Component({
  selector: 'app-publicacion-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="publicacion">
      <h4>{{ publicacion.titulo }}</h4>
      <p>{{ publicacion.mensaje }}</p>
      <small>{{ publicacion.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
      <div *ngIf="publicacion.imagen">
        <img [src]="publicacion.imagen" alt="Imagen de publicación" />
      </div>
      <p>Me gusta: {{ publicacion.meGusta?.length || 0 }}</p>
    </div>
  `,
  styles: [`
    .publicacion {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      background: white;
    }
    h4 {
      margin: 0 0 10px 0;
      color: #333;
    }
    p {
      margin: 8px 0;
      color: #555;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-top: 10px;
    }
    small {
      color: #999;
      font-size: 0.85rem;
    }
  `]
})
export class PublicacionItemComponent {
  @Input() publicacion!: Publicacion;
}