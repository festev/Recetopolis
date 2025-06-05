import { NgModule } from '@angular/core'; // Angular Core Imports: Módulos y clases esenciales para el enrutamiento.
import { Routes, RouterModule } from '@angular/router'; // Routes para definir las rutas, RouterModule para configurar el enrutador.

import { AuthPage } from './auth.page';
import { NoAuthGuard } from 'src/app/guards/no-auth.guard';

/**
 * Definición de las rutas específicas para el módulo de autenticación (Auth).
 * Estas rutas son hijas y se cargarán relativas a la ruta donde se cargue este AuthPageModule.
 */
const routes: Routes = [
  {
    // Ruta base para el módulo de autenticación (ej. '/auth').
    // Cuando el usuario navega a esta ruta, se renderiza el componente AuthPage.
    path: '', // El path vacío indica la ruta raíz del módulo padre que carga este routing module.
    component: AuthPage
  },
  {
    // Ruta para la página de registro ('sign-up').
    path: 'sign-up',
    loadChildren: () => import('./sign-up/sign-up.module').then( m => m.SignUpPageModule)
  },
  {
    // Ruta para la página de recuperación de contraseña ('forgot-password').
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'reset-password/:token', // La ruta para restablecer contraseña espera un parámetro 'token'
    loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}
