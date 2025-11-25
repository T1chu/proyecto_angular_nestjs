// frontend/src/app/app.routes.ts (ACTUALIZADO)
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { PublicacionesComponent } from './components/publicaciones/publicaciones.component';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';
import { LoadingComponent } from './components/loading/loading.component';
import { PublicacionDetalleComponent } from './components/publicacion-detalle/publicacion-detalle.component';
import { DashboardUsuariosComponent } from './components/dashboard-usuarios/dashboard-usuarios.component';
import { DashboardEstadisticasComponent } from './components/dashboard-estadisticas/dashboard-estadisticas.component';

export const routes: Routes = [
  {
    path: '',
    component: LoadingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registro',
    component: RegistroComponent
  },
  {
    path: 'publicaciones',
    component: PublicacionesComponent
  },
  {
    path: 'publicaciones/:id',
    component: PublicacionDetalleComponent
  },
  {
    path: 'mi-perfil',
    component: MiPerfilComponent
  },
  {
    path: 'dashboard/usuarios',
    component: DashboardUsuariosComponent
  },
  {
    path: 'dashboard/estadisticas',
    component: DashboardEstadisticasComponent
  },
  {
    path: '**',
    redirectTo: '',
  },
];