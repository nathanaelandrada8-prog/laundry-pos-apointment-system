import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { LogoutModal } from '../../components/logout-modal/logout-modal';
import { AuthUiService } from '../../core/services/ui.service';
import { USER_MENU, ADMIN_MENU } from '../../core/services/nav.helper';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Sidebar, LogoutModal],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  protected authUi = inject(AuthUiService);
  protected authService = inject(AuthService);
  protected orderService = inject(OrderService);

  ngOnInit() {
    this.orderService.checkActiveBooking();
  }

  menuItems = computed(() => {
    const user = this.authService.user();
    return user?.role === 'admin' ? ADMIN_MENU : USER_MENU;
  });

  role = computed(() => this.authService.user()?.role || 'customer');
}