import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/front-page/landing-page/landing-page').then(m => m.LandingPage)
    },
    {
        path: 'user',
        component: MainLayout,
        canActivate: [roleGuard],
        data: { roles: ['customer'] },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/user/user-dashboard/user-dashboard').then(m => m.UserDashboard)
            },
            {
                path: 'order',
                loadComponent: () => import('./pages/user/user-order/user-order').then(m => m.UserOrder)
            },
            {
                path: 'track-order',
                loadComponent: () => import('./pages/user/user-trackdr/user-trackdr').then(m => m.UserTrackdr)
            },
            {
                path: 'history',
                loadComponent: () => import('./pages/user/user-history/user-history').then(m => m.UserHistory)
            },
            {
                path: 'profile',
                loadComponent: () => import('./pages/user/user-profile/user-profile').then(m => m.UserProfile)
            }
        ]
    },
    {
        path: 'admin',
        component: MainLayout,
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
            },
            {
                path: 'pos-system',
                loadComponent: () => import('./pages/admin/admin-pos/admin-pos').then(m => m.AdminPos)
            },
            {
                path: 'pending-requests',
                loadComponent: () => import('./pages/admin/admin-request/admin-request').then(m => m.AdminRequest)
            },
            {
                path: 'manage-orders',
                loadComponent: () => import('./pages/admin/admin-manage/admin-manage').then(m => m.AdminManage)
            }
        ]
    }
];
