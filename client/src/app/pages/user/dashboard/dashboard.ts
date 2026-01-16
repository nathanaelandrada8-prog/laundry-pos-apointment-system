import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  auth = inject(AuthService);
  orderService = inject(OrderService);

  user = this.auth.user;
  activeOrder = this.orderService.currentOrder;

  // Mock data for spending (In a real app, you'd fetch this from a summary API)
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