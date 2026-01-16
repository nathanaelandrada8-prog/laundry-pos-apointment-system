import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track.html',
  styleUrl: './track.scss'
})
export class Track {
  orderService = inject(OrderService);
  
  // Link the signal to a local variable for cleaner HTML
  order = this.orderService.currentOrder;

  // Define steps for the visual progress bar
  steps = [
    { label: 'Pending', status: 'Pending', icon: 'pending_actions' },
    { label: 'Confirmed', status: 'Confirmed', icon: 'check_circle' },
    { label: 'In Progress', status: 'In Progress', icon: 'wash' },
    { label: 'Out for Delivery', status: 'Out for Delivery', icon: 'local_shipping' },
    { label: 'Completed', status: 'Completed', icon: 'task_alt' }
  ];

  isCurrent(stepStatus: string): boolean {
    return this.order()?.status === stepStatus;
  }

  // Logic to determine if a step is already finished
  isPast(index: number): boolean {
    const statusOrder = ['Pending', 'Confirmed', 'In Progress', 'Out for Delivery', 'Completed'];
    const currentIdx = statusOrder.indexOf(this.order()?.status);
    return index < currentIdx;
  }
}