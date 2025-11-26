// frontend/src/app/services/pwa-update.service.ts
import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval, concat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {
  constructor(
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef
  ) {}

  inicializar(): void {
    if (!this.swUpdate.isEnabled) {
      console.log('⚠️ Service Worker no está habilitado');
      return;
    }

    // Verificar actualizaciones cuando la app esté estable
    const appIsStable$ = this.appRef.isStable.pipe(
      filter(isStable => isStable === true)
    );
    const everySixHours$ = interval(6 * 60 * 60 * 1000); // cada 6 horas

    concat(appIsStable$, everySixHours$).subscribe(() => {
      this.swUpdate.checkForUpdate().then(() => {
        console.log('✅ Verificación de actualizaciones completada');
      });
    });

    // Detectar cuando hay una nueva versión disponible
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(evt => {
        console.log('🆕 Nueva versión disponible:', evt.latestVersion);
        
        const confirmar = confirm(
          '¡Hay una nueva versión disponible! ¿Quieres actualizar ahora?'
        );
        
        if (confirmar) {
          this.swUpdate.activateUpdate().then(() => {
            console.log('✅ Actualizando...');
            document.location.reload();
          });
        }
      });

    // Detectar errores de instalación
    this.swUpdate.unrecoverable.subscribe(event => {
      console.error('❌ Error irrecuperable del Service Worker:', event.reason);
      alert(
        'Se ha detectado un error en la aplicación. ' +
        'Por favor, recarga la página.'
      );
    });
  }

  verificarActualizacion(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then(disponible => {
        if (disponible) {
          console.log('🆕 Actualización disponible');
        } else {
          console.log('✅ La aplicación está actualizada');
        }
      });
    }
  }
}