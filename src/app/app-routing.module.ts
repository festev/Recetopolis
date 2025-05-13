import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
// Los guards NoAuthGuard y AuthGuard están comentados en tus rutas,
// puedes descomentarlos ('canActivate') cuando los necesites.
// import { NoAuthGuard } from './guards/no-auth.guard';
// import { AuthGuard } from './guards/auth.guard';
import { FavoritosPage } from './pages/main/favoritos/favoritos.page';
// Nota: MainPage ya no se importa aquí porque 'main.module' se carga mediante loadChildren.

const routes: Routes = [
  {
    path: '', // Esta es la ruta raíz de tu aplicación (ej: http://localhost:8100/)
    redirectTo: 'auth', // Redirige automáticamente a la ruta '/auth'
    pathMatch: 'full' // Es importante para que solo coincida con la ruta vacía exacta
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule) // , canActivate:[NoAuthGuard]
  },
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainPageModule) // , canActivate:[AuthGuard]
  },
  {
    // Si 'TabsPageModule' es una sección a la que necesitas navegar
    // (quizás después del login o como parte de 'main'),
    // necesita su propia ruta. Si 'tabs' era solo tu página de inicio anterior
    // y ahora todo comienza con 'auth' y luego va a 'main',
    // y 'tabs' ya no es una sección principal separada, podrías incluso eliminar esta ruta
    // o integrarla dentro del enrutamiento de 'main.module'.
    // Por ahora, le asignamos una ruta específica: '/tabs'.
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'favoritos', // Asumiendo que 'favoritos' es una página accesible directamente
    component: FavoritosPage
    // Si 'FavoritosPage' fuera parte de 'MainPageModule', su ruta se definiría
    // dentro de 'main-routing.module.ts'.
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
