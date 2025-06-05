// Angular Core Imports: Módulos y decoradores esenciales de Angular.
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'; // PreloadAllModules para la estrategia de precarga.
// Guard Imports: Guards para proteger rutas.
import { NoAuthGuard } from './guards/no-auth.guard'; // Guarda para rutas accesibles solo por usuarios no autenticados.
import { AuthGuard } from './guards/auth.guard'; // Guarda para rutas accesibles solo por usuarios autenticados.

/**
 * Definición de las rutas principales de la aplicación.
 * Estas rutas configuran la navegación a nivel raíz.
 */
const routes: Routes = [
  {
    // Ruta por defecto de la aplicación.
    // Redirige la ruta vacía ('') a '/auth'.
    path: '',
    redirectTo: 'auth', // página de inicio por defecto
    pathMatch: 'full' // 'full' significa que la URL completa debe coincidir con el path vacío.
  },
  {
    // Ruta para la sección de autenticación (login, sign-up, etc.).
    // Se carga de forma diferida (lazy loading) el módulo AuthPageModule.
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthPageModule),
    canActivate:[NoAuthGuard] // Protege esta ruta para que solo usuarios no logueados puedan acceder.
  },
  {
    // Ruta para la sección principal de la aplicación después del login.
    // Se carga de forma diferida (lazy loading) el módulo MainPageModule.
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then( m => m.MainPageModule),
    canActivate:[AuthGuard] // Protege esta ruta para que solo usuarios logueados puedan acceder.
  }

];

/**
 * NgModule Decorator: Define la clase AppRoutingModule como un módulo de enrutamiento de Angular.
 * Este es el módulo de enrutamiento raíz de la aplicación.
 */
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

