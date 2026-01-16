import { CommonModule } from '@angular/common';
import { OrderService } from './../../../core/services/order.service';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WASH_TYPES } from '../../../core/services/nav.helper';

@Component({
  selector: 'app-admin-request',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-request.html',
  styleUrl: './admin-request.scss',
})
export class AdminRequest {
  private orderService = inject(OrderService);

  requests = computed(() => this.orderService.pendingOrders().filter(o => o.status === 'Pending'));
  selectedRequest: any = null;
  denyReason: string = '';
  washMethods = WASH_TYPES;

  getSelectedMethodName(method: string) {
    return this.washMethods.find(m => m.id === method)?.name;
  }

  approveRequest(id: string) {
    this.orderService.updateOrderStatus(id, 'Approved').subscribe({
      next: () => {
        // The tapping in the service already handles removing it from the signal
        console.log('Order approved successfully');
      },
      error: (err) => alert('Error: ' + err.error.message)
    });
  }

  openDenyModal(request: any) {
    this.selectedRequest = request;
    this.denyReason = '';
  }

  confirmDeny() {
    // Use 'Cancelled' status for denials
    this.orderService.updateOrderStatus(this.selectedRequest._id, 'Cancelled').subscribe({
      next: () => {
        this.selectedRequest = null;
      },
      error: (err) => alert('Error: ' + err.error.message)
    });
  }
}
