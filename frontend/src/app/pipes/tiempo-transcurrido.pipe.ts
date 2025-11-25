// frontend/src/app/pipes/tiempo-transcurrido.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoTranscurrido',
  standalone: true
})
export class TiempoTranscurridoPipe implements PipeTransform {
  transform(value: Date | string): string {
    if (!value) return '';
    
    const ahora = new Date().getTime();
    const fecha = new Date(value).getTime();
    const diferencia = ahora - fecha;
    
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 30) {
      return new Date(value).toLocaleDateString('es-ES');
    } else if (dias > 0) {
      return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    } else if (horas > 0) {
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (minutos > 0) {
      return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else {
      return 'Hace un momento';
    }
  }
}