import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Define la ruta principal (ej. tu-dominio.com/registro)
    path: 'registro',
    loadChildren: () => import('./features/registration/registration.routes').then(m => m.REGISTRATION_ROUTES)
  },
  {
    // Opcional: Redirección por defecto si el usuario entra a la raíz de la app (tu-dominio.com/)
    path: '',
    redirectTo: 'registro', // Los envía directamente al flujo del congreso
    pathMatch: 'full'
  },
  {
    // Opcional: Ruta "comodín" (Catch-all) por si el usuario escribe una URL que no existe
    path: '**',
    redirectTo: 'registro'
  }
];
