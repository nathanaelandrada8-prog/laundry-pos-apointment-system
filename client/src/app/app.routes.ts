import { Routes } from '@angular/router';
import { FrontLayoutComponent } from './layouts/front-layout/front-layout';
import { FrontPageComponent } from './pages/front/front-page/front-page';
import { UserLayoutComponent } from './layouts/user-layout/user-layout';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { OurService } from './pages/front/our-service/our-service';
import { ContactUs } from './pages/front/contact-us/contact-us';
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: FrontLayoutComponent,
    children: [
      { path: '', component: FrontPageComponent },
      { path: 'our-service', component: OurService },
      { path: 'contact-us', component: ContactUs }
    ]
  },
  {
    path: 'user',
    canActivate: [roleGuard],
    data: { roles: ['customer'] },
    component: UserLayoutComponent,
    children: [
      {
        path: 'dashboard', 
        loadComponent: () => import('./pages/user/dashboard/dashboard').then(m => m.Dashboard) 
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./pages/user/orders/orders').then(m => m.Orders) 
      },
      { 
        path: 'track', 
        loadComponent: () => import('./pages/user/track/track').then(m => m.Track) 
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/user/profile/profile').then(m => m.Profile) 
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'pos',
        loadComponent: () => import('./pages/admin/pos/pos').then(m => m.Pos)
      },
      {
        path: 'requests',
        loadComponent: () => import('./pages/admin/pending-requests/pending-requests').then(m => m.PendingRequests)
      },
      {
        path: 'manage-orders',
        loadComponent: () => import('./pages/admin/order-management/order-management').then(m => m.OrderManagement)
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/admin/customers/customers').then(m => m.Customers)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/admin/settings/settings').then(m => m.Settings)
      }
    ]
  }
];