// frontend/src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { PwaUpdateService } from './services/pwa-update.service';
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
    
    <!-- Banner de instalación PWA -->
    <div *ngIf="mostrarBannerInstalacion" class="pwa-install-banner">
      <div class="banner-content">
        <span class="banner-icon">📱</span>
        <div class="banner-text">
          <strong>Instala nuestra app</strong>
          <p>Accede más rápido desde tu pantalla de inicio</p>
        </div>
        <div class="banner-actions">
          <button class="btn-instalar" (click)="instalarPWA()">Instalar</button>
          <button class="btn-cerrar" (click)="cerrarBannerInstalacion()">✕</button>
        </div>
      </div>
    </div>
    
    <!-- Indicador de offline -->
    <div *ngIf="!estaOnline" class="offline-indicator">
      📡 Sin conexión - Modo offline
    </div>
  `,
  styles: [`
    .pwa-install-banner {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(26, 26, 26, 0.98);
      border: 2px solid #dc143c;
      border-radius: 15px;
      padding: 1rem 1.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.9);
      z-index: 10000;
      max-width: 500px;
      width: 90%;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }

    .banner-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .banner-icon {
      font-size: 2.5rem;
    }

    .banner-text {
      flex: 1;
    }

    .banner-text strong {
      display: block;
      color: #fff;
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
    }

    .banner-text p {
      margin: 0;
      color: #b0b0b0;
      font-size: 0.9rem;
    }

    .banner-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-instalar {
      padding: 0.5rem 1.5rem;
      background: linear-gradient(135deg, #dc143c 0%, #b01030 100%);
      color: white;
      border: none;
      border-radius: 25px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-instalar:hover {
      background: linear-gradient(135deg, #ff1744 0%, #dc143c 100%);
      transform: translateY(-2px);
    }

    .btn-cerrar {
      background: none;
      border: none;
      color: #888;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      line-height: 1;
      transition: all 0.3s;
    }

    .btn-cerrar:hover {
      color: #dc143c;
    }

    .offline-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc143c;
      color: white;
      text-align: center;
      padding: 0.5rem;
      font-weight: 700;
      z-index: 10001;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .pwa-install-banner {
        bottom: 10px;
        padding: 0.75rem 1rem;
      }

      .banner-content {
        flex-wrap: wrap;
      }

      .banner-actions {
        width: 100%;
        justify-content: space-between;
        margin-top: 0.5rem;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  mostrarModalSesion = false;
  mostrarBannerInstalacion = false;
  estaOnline = true;
  private sessionTimer: any;
  private warningTimer: any;
  private deferredPrompt: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private pwaUpdateService: PwaUpdateService
  ) {}

  ngOnInit() {
    // Inicializar PWA
    this.pwaUpdateService.inicializar();
    this.detectarEstadoConexion();
    this.detectarEventoInstalacion();

    // Sesión
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarYConfigurarSesion();
      });

    this.verificarYConfigurarSesion();
  }

  ngOnDestroy() {
    this.limpiarTimers();
  }

  // ===== MÉTODOS PWA =====

  detectarEstadoConexion(): void {
    this.estaOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      console.log('✅ Conexión restaurada');
      this.estaOnline = true;
    });

    window.addEventListener('offline', () => {
      console.log('📡 Sin conexión');
      this.estaOnline = false;
    });
  }

  detectarEventoInstalacion(): void {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      console.log('📱 Evento de instalación detectado');
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Mostrar banner después de 10 segundos (solo si no está instalada)
      setTimeout(() => {
        if (!this.estaInstalada()) {
          this.mostrarBannerInstalacion = true;
        }
      }, 10000);
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada correctamente');
      this.mostrarBannerInstalacion = false;
      this.deferredPrompt = null;
    });
  }

  async instalarPWA(): Promise<void> {
    if (!this.deferredPrompt) {
      console.log('⚠️ No se puede instalar en este momento');
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
    
    this.deferredPrompt = null;
    this.mostrarBannerInstalacion = false;
  }

  cerrarBannerInstalacion(): void {
    this.mostrarBannerInstalacion = false;
    localStorage.setItem('pwa_banner_cerrado', Date.now().toString());
  }

  estaInstalada(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // ===== MÉTODOS DE SESIÓN (mantener los existentes) =====

  verificarYConfigurarSesion() {
    const token = this.authService.getToken();
    const loginTime = this.authService.getLoginTime();

    if (token && loginTime) {
      const tiempoTranscurrido = Date.now() - loginTime;
      const DIEZ_MINUTOS = 10 * 60 * 1000;
      const QUINCE_MINUTOS = 15 * 60 * 1000;

      this.limpiarTimers();

      if (tiempoTranscurrido < DIEZ_MINUTOS) {
        const tiempoRestante = DIEZ_MINUTOS - tiempoTranscurrido;
        this.warningTimer = setTimeout(() => {
          this.mostrarAdvertenciaSesion();
        }, tiempoRestante);
      } else if (tiempoTranscurrido < QUINCE_MINUTOS) {
        this.mostrarAdvertenciaSesion();
      } else {
        this.cerrarSesion();
      }
    }
  }

  mostrarAdvertenciaSesion() {
    this.mostrarModalSesion = true;
    this.sessionTimer = setTimeout(() => {
      this.cerrarSesion();
    }, 5 * 60 * 1000);
  }

  async extenderSesion() {
    const exito = await this.authService.refrescarToken();
    
    if (exito) {
      this.mostrarModalSesion = false;
      this.limpiarTimers();
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