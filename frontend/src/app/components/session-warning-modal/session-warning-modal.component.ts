// frontend/src/app/components/session-warning-modal/session-warning-modal.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-warning-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-icon">⏰</div>
        <h2>Tu sesión está por expirar</h2>
        <p>Quedan 5 minutos antes de que tu sesión expire.</p>
        <p class="question">¿Deseas extender tu sesión?</p>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="onCancel()">
            Cerrar Sesión
          </button>
          <button class="btn btn-primary" (click)="onExtend()">
            Extender Sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
      backdrop-filter: blur(5px);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: rgba(26, 26, 26, 0.98);
      border-radius: 15px;
      padding: 3rem 2.5rem;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(220, 20, 60, 0.5);
      border: 1px solid rgba(220, 20, 60, 0.4);
      animation: slideUp 0.3s ease;
      text-align: center;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .modal-content h2 {
      margin: 0 0 1rem 0;
      font-size: 1.8rem;
      color: #fff;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .modal-content p {
      margin: 0.5rem 0;
      color: #b0b0b0;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .question {
      color: #dc143c;
      font-weight: 700;
      font-size: 1.2rem;
      margin-top: 1.5rem;
    }

    .modal-actions {
      margin-top: 2.5rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-secondary {
      background: rgba(220, 20, 60, 0.1);
      color: #dc143c;
      border: 2px solid #dc143c;
    }

    .btn-secondary:hover {
      background: rgba(220, 20, 60, 0.2);
      transform: translateY(-2px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #dc143c 0%, #b01030 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #ff1744 0%, #dc143c 100%);
      box-shadow: 0 6px 20px rgba(220, 20, 60, 0.6);
      transform: translateY(-2px);
    }

    @media (max-width: 600px) {
      .modal-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class SessionWarningModalComponent {
  @Output() extend = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onExtend(): void {
    this.extend.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}