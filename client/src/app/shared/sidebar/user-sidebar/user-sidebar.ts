import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthUiService } from '../../../core/services/auth-ui.service';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-sidebar.html',
  styleUrl: './user-sidebar.scss'
})
export class UserSidebarComponent {
  private authUiService = inject(AuthUiService);
  menuOpen = signal(false);
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/user/dashboard' },
    { label: 'Order', icon: 'local_laundry_service', route: '/user/orders' },
    { label: 'Track Order', icon: 'map', route: '/user/track' },
    { label: 'My Profile', icon: 'person', route: '/user/profile' }
  ];

  onLogout() {
    this.authUiService.openLogout();
  }
  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }
}