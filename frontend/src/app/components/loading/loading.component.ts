// frontend/src/app/components/loading/loading.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
      <div class="loading-content">
        <div class="logo">
          <div class="logo-circle"></div>
          <h1>Red Social</h1>
        </div>
        <div class="spinner"></div>
        <p class="loading-text">Validando sesión...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #8b0000 100%);
      position: relative;
      overflow: hidden;
    }

    .loading-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 50%, rgba(220, 20, 60, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(220, 20, 60, 0.1) 0%, transparent 50%);
      animation: pulse 4s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .loading-content {
      text-align: center;
      z-index: 1;
    }

    .logo {
      margin-bottom: 3rem;
    }

    .logo-circle {
      width: 100px;
      height: 100px;
      margin: 0 auto 1rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #dc143c 0%, #b01030 100%);
      box-shadow: 0 0 50px rgba(220, 20, 60, 0.8), 0 0 100px rgba(220, 20, 60, 0.4);
      animation: logoSpin 3s ease-in-out infinite;
    }

    @keyframes logoSpin {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(180deg); }
    }

    .logo h1 {
      color: #fff;
      font-size: 2.5rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin: 0;
      text-shadow: 0 0 20px rgba(220, 20, 60, 0.8);
    }

    .spinner {
      width: 60px;
      height: 60px;
      margin: 0 auto 2rem;
      border: 5px solid rgba(220, 20, 60, 0.2);
      border-top-color: #dc143c;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: #b0b0b0;
      font-size: 1.2rem;
      font-weight: 600;
      letter-spacing: 1px;
      animation: fade 2s ease-in-out infinite;
    }

    @keyframes fade {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  `]
})
export class LoadingComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.validarSesion();
  }

  async validarSesion(): Promise<void> {
    try {
      const token = this.authService.getToken();
      
      if (!token) {
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
        return;
      }

      const response = await this.authService.validarToken(token);
      
      if (response && response.valido) {
        setTimeout(() => {
          this.router.navigate(['/publicaciones']);
        }, 1000);
      } else {
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 1000);
      }
    } catch (error) {
      console.error('Error validando sesión:', error);
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }, 1000);
    }
  }
}