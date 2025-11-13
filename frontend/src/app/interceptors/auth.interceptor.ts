// frontend/src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('loginTime');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};