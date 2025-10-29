// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'publicaciones',
    loadComponent: () => import('./components/publicaciones/publicaciones.component').then(m => m.PublicacionesComponent)
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./components/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];