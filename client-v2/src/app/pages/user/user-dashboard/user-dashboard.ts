import { OrderService } from './../../../core/services/order.service';
import { AuthService } from './../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss',
})
export class UserDashboard {
  auth = inject(AuthService);
  orderService = inject(OrderService);

  user = this.auth.user;
  activeOrder = this.orderService.currentOrder;

  stats = {
    totalSpent: 1250.00,
    ordersThisMonth: 4,
    savedTimeHours: 12
  };

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }
}
