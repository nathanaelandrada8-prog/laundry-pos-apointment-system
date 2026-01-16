import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';


@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-requests.html',
  styleUrl: './pending-requests.scss'
})
export class PendingRequests {
  private orderService = inject(OrderService);

  requests = this.orderService.getRequests();
  selectedRequest: any = null;
  denyReason: string = '';

  approveRequest(id: number) {
    this.orderService.removeRequest(id);
  }

  openDenyModal(request: any) {
    this.selectedRequest = request;
    this.denyReason = '';
  }

  confirmDeny() {
      this.orderService.removeRequest(this.selectedRequest.id);
      this.selectedRequest = null;
    }
}