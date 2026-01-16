import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  washMethods = [
  { id: 'wash_dry', name: 'Wash & Dry', icon: 'local_laundry_service', desc: 'Standard machine wash' },
  { id: 'wash_dry_fold', name: 'Wash, Dry & Fold', icon: 'layers', desc: 'Cleaned and neatly folded' },
  { id: 'dry_clean', name: 'Dry Cleaning', icon: 'dry_cleaning', desc: 'For delicate garments' },
  { id: 'hand_wash', name: 'Hand Wash', icon: 'front_loader', desc: 'Extra care for your items' }
];
  orderData = {
    method : '',
    pickupDate: '',
    pickupTime: '',
    deliveryDate: '',
    deliveryTime: ''
  };
  hasActiveOrder = this.orderService.hasActiveBooking;
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
        return;
    }
   this.orderService.createNewOrder(this.orderData).subscribe({
      next: (res) => {
        console.log('Order created!', res);
        this.router.navigate(['/user/track']);
      },
      error: (err) => alert('Order failed: ' + err.error.message)
    });
  }

  showProfileModal = false;

  ngOnInit() {
    const user = this.authService.user();
    if (!user?.address || !user?.phone) {
      this.showProfileModal = true;
    }
  }

  closeModal() {
    this.showProfileModal = false;
  }
}