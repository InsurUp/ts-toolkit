import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'callback',
    loadComponent: () => import('./pages/callback/callback.component').then(m => m.CallbackComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'customers',
    loadComponent: () => import('./pages/customers/customer-list.component').then(m => m.CustomerListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'customers/:id',
    loadComponent: () => import('./pages/customers/customer-detail.component').then(m => m.CustomerDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'policies',
    loadComponent: () => import('./pages/policies/policy-list.component').then(m => m.PolicyListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'policies/:id',
    loadComponent: () => import('./pages/policies/policy-detail.component').then(m => m.PolicyDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
