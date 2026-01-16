import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { PROGRESS_STEPS } from '../../../core/services/nav.helper';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-trackdr',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-trackdr.html',
  styleUrl: './user-trackdr.scss',
})
export class UserTrackdr {
    orderService = inject(OrderService);
    order = this.orderService.currentOrder;
    steps = PROGRESS_STEPS;
    isCancel = false;

    isCurrent(stepStatus: string): boolean {
      return this.order()?.status === stepStatus;
    }

    isPast(index: number): boolean {
      const statusOrder = PROGRESS_STEPS.map(step => step.status);
      const currentIdx = statusOrder.indexOf(this.order()?.status);
      return index < currentIdx;
    }

    confirmCancellation(){
      //
    }

    openCancelModal(){
      this.isCancel = true;
    }

    closeCancelModal(){
      this.isCancel = false;
    }
}
