import { Component, inject, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WASH_TYPES } from '../../../core/services/nav.helper';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { Router, RouterLink } from '@angular/router';
import { AutoValidateDirective } from '../../../core/services/form.helper';

@Component({
  selector: 'app-user-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AutoValidateDirective],
  templateUrl: './user-order.html',
  styleUrl: './user-order.scss',
})
export class UserOrder {
    private orderService = inject(OrderService);
    private authService = inject(AuthService);
    private router = inject(Router);
    @ViewChildren(AutoValidateDirective) inputs!: QueryList<AutoValidateDirective>;

    hasActiveOrder = this.orderService.hasActiveBooking;
    washMethods = WASH_TYPES;
    showProfileModal = false;
    disabled = false;

    orderData = {
      method : '',
      pickupDate: '',
      pickupTime: '',
      deliveryDate: '',
      deliveryTime: ''
    };

    ngOnInit() {
      const user = this.authService.user();
      if (!user?.address || !user?.phone) {
          this.showProfileModal = true;
          this.disabled = true;
      }
    }

    updateDeliveryDate() {
      if (this.orderData.pickupDate) {
          const pickup = new Date(this.orderData.pickupDate);
          pickup.setDate(pickup.getDate() + 2);
          this.orderData.deliveryDate = pickup.toISOString().split('T')[0];
      }
    }

    getSelectedMethodName() {
      return this.washMethods.find(m => m.id === this.orderData.method)?.name;
    }

    submitOrder(form: any) {
      if (form.invalid) {
          Object.values(form.controls).forEach((control: any) => {
            control.markAsTouched();
          });
          this.inputs.forEach(directive => directive.updateErrorMessage());
          return;
      }
      if (!this.authService.isProfileComplete()) {
          this.showProfileModal = true;
          this.disabled = true;
          return;
      }
      this.orderService.createNewOrder(this.orderData).subscribe({
        next: () => {
          this.router.navigate(['/user/track-order']);
        },
        error: (err) => alert('Order Failed: ' + err.error.message)
      });
    }

    closeModal() {
      this.showProfileModal = false;
    }
}
