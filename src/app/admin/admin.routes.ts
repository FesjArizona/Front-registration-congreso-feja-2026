import { Routes } from '@angular/router';
import { authGuard, eventGuard } from './auth/auth/guard/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard], // ← todas las rutas admin requieren login
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'congreso/overview',
        pathMatch: 'full',
      },

      // ── Congreso Union ─────────────────────────────────────────────────────
      {
        path: 'congreso',
        canActivateChild: [eventGuard], // ← solo admin o admin_event soccer
        data: { event: 'congreso' },
        children: [
          /* { path: '', redirectTo: 'overview', pathMatch: 'full' }, */
          {
            path: 'overview',
            data: { event: 'congreso' },
            loadComponent: () =>
              import('./features/congreso-union/overview-congreso/overview-congreso.component')
                .then(m => m.OverviewCongresoComponent),
          },
          {
            path: 'registered',
            data: { event: 'congreso' },
            loadComponent: () =>
              import('./features/congreso-union/registrados/registrados.component')
                .then(m => m.RegistradosComponent),
          },
          {
            path: 'checkin',
            data: { event: 'congreso' },
            loadComponent: () =>
              import('./features/congreso-union/checkin/checkin.component')
                .then(m => m.CheckinComponent),
          },
        ],
      },
    ],
  },
];
