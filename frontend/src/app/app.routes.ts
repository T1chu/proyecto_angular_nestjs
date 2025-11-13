import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { PublicacionesComponent } from './components/publicaciones/publicaciones.component';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';
import { LoadingComponent } from './components/loading/loading.component';
import { PublicacionDetalleComponent } from './components/publicacion-detalle/publicacion-detalle.component';

export const routes: Routes = [
  {
    path: '',
    component: LoadingComponent // Cambiar a loading en lugar de redirigir
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
    path: '**',
    redirectTo: '',
  },
];