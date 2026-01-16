import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-pos',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pos.html',
  styleUrl: './admin-pos.scss',
})
export class AdminPos {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private router = inject(Router);

  taggedOrder = signal<any>(null);
  today = new Date();

  // POS Billing state
  weight = 0;
  pricePerKg = 35; // Example base price
  additionalFees = 0;
  total = 0;

  ngOnInit() {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (orderId) {
      // Find the order in our existing signal list
      const order = this.orderService.pendingOrders().find(o => o._id === orderId);
      if (order) {
        this.taggedOrder.set(order);
      }
    }
  }

  calculateTotal() {
    this.total = (this.weight * this.pricePerKg) + this.additionalFees;
  }

  processPayment() {
    if (!this.taggedOrder()) return;

    const billingData = {
      weight: this.weight,
      pricePerKg: this.pricePerKg,
      additionalFees: this.additionalFees,
      totalAmount: this.total
    };

    this.orderService.updateOrderStatus(
      this.taggedOrder()._id,
      'Pick Up',
      billingData
    ).subscribe({
      next: () => {
        alert('Payment Processed! Order is now Ready for Pick-up.');
        this.router.navigate(['/admin/manage-orders']);
      },
      error: (err) => alert('Checkout failed: ' + err.error.message)
    });
  }

}
