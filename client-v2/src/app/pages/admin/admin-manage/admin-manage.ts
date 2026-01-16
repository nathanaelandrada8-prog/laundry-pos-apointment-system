import { Component, computed, inject } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { WASH_TYPES } from '../../../core/services/nav.helper';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-manage',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manage.html',
  styleUrl: './admin-manage.scss',
})
export class AdminManage {
private orderService = inject(OrderService);
  private router = inject(Router);

  washMethods = WASH_TYPES;

  statusOptions = [
    'Pick Up', 'In Progress', 'Out for Delivery', 'Completed'
  ];

  activeOrders = computed(() =>
    this.orderService.pendingOrders().filter(o =>
      !['Pending', 'Cancelled'].includes(o.status)
    )
  );

  getMethodName(methodId: string) {
    return this.washMethods.find(m => m.id === methodId)?.name || methodId;
  }

  getAvailableStatuses(currentStatus: string) {
    const currentIndex = this.statusOptions.indexOf(currentStatus);
    return currentIndex === -1 ? this.statusOptions : this.statusOptions.slice(currentIndex);
  }

  updateStatus(orderId: string, newStatus: string) {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => console.log(`Order ${orderId} updated to ${newStatus}`),
      error: (err) => alert('Update failed: ' + err.error.message)
    });
  }

  goToPos(orderId: string) {
    this.router.navigate(['/admin/pos-system'], {
      queryParams: { orderId: orderId }
    });
  }
}
