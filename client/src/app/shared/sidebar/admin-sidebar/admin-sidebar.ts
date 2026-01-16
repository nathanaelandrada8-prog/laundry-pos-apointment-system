import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthUiService } from '../../../core/services/auth-ui.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss'
})
export class AdminSidebarComponent {
  authUi = inject(AuthUiService);
  menuOpen = signal(true);
  private orderService = inject(OrderService);
  
  // Access the count signal from the service
  pendingCount = this.orderService.pendingCount;
  adminMenu = [
    { label: 'Dashboard', icon: 'analytics', route: '/admin/dashboard' },
    { label: 'POS System', icon: 'point_of_sale', route: '/admin/pos' },
    { label: 'Pending Requests', icon: 'pending_actions', route: '/admin/requests' },
    { label: 'Order Management', icon: 'assignment', route: '/admin/manage-orders' },
    { label: 'Customers', icon: 'people', route: '/admin/customers' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' }
  ];

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  onLogout() {
    this.authUi.openLogout();
  }
}