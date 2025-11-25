// frontend/src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { SessionWarningModalComponent } from './components/session-warning-modal/session-warning-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SessionWarningModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-session-warning-modal 
      *ngIf="mostrarModalSesion"
      (extend)="extenderSesion()"
      (cancel)="cerrarSesion()"
    ></app-session-warning-modal>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  mostrarModalSesion = false;
  private sessionTimer: any;
  private warningTimer: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarYConfigurarSesion();
      });

    // Configurar al inicio
    this.verificarYConfigurarSesion();
  }

  ngOnDestroy() {
    this.limpiarTimers();
  }

  verificarYConfigurarSesion() {
    const token = this.authService.getToken();
    const loginTime = this.authService.getLoginTime();

    if (token && loginTime) {
      const tiempoTranscurrido = Date.now() - loginTime;
      const DIEZ_MINUTOS = 10 * 60 * 1000; // 10 minutos
      const QUINCE_MINUTOS = 15 * 60 * 1000; // 15 minutos

      // Limpiar timers existentes
      this.limpiarTimers();

      if (tiempoTranscurrido < DIEZ_MINUTOS) {
        // Aún no han pasado 10 minutos, configurar timer
        const tiempoRestante = DIEZ_MINUTOS - tiempoTranscurrido;
        this.warningTimer = setTimeout(() => {
          this.mostrarAdvertenciaSesion();
        }, tiempoRestante);
      } else if (tiempoTranscurrido < QUINCE_MINUTOS) {
        // Ya pasaron 10 minutos pero no 15, mostrar modal inmediatamente
        this.mostrarAdvertenciaSesion();
      } else {
        // Ya expiro la sesión
        this.cerrarSesion();
      }
    }
  }

  mostrarAdvertenciaSesion() {
    this.mostrarModalSesion = true;

    // Configurar timer de expiración (5 minutos después de mostrar el modal)
    this.sessionTimer = setTimeout(() => {
      this.cerrarSesion();
    }, 5 * 60 * 1000);
  }

  async extenderSesion() {
    const exito = await this.authService.refrescarToken();
    
    if (exito) {
      this.mostrarModalSesion = false;
      this.limpiarTimers();
      // Reconfigurar timers con el nuevo token
      this.verificarYConfigurarSesion();
    } else {
      alert('No se pudo extender la sesión');
      this.cerrarSesion();
    }
  }

  cerrarSesion() {
    this.mostrarModalSesion = false;
    this.limpiarTimers();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private limpiarTimers() {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }
}