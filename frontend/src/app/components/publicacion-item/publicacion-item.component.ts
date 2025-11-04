import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../services/publications.service';

@Component({
  selector: 'app-publicacion-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="publicacion">
      <p>{{ publicacion.descripcion }}</p>
      <small>{{ publicacion.fechaPublicacion | date }}</small>
      <div *ngIf="publicacion.archivo">
        <img [src]="publicacion.archivo" alt="Imagen de publicación" />
      </div>
      <p>Me gusta: {{ publicacion.megusta.length }}</p>
    </div>
  `,
  styles: [`
    .publicacion {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  `]
})
export class PublicacionItemComponent {
  @Input() publicacion!: Publicacion;
}
