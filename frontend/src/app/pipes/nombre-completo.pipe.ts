import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreCompleto',
  standalone: true
})
export class NombreCompletoPipe implements PipeTransform {
  transform(usuario: { nombre: string; apellido?: string }): string {
    if (!usuario) return '';
    return `${usuario.nombre}${usuario.apellido ? ' ' + usuario.apellido : ''}`;
  }
}