import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
private http = inject(HttpClient);
  
  currentOrder = signal<any>(null);
  hasActiveBooking = computed(() => this.currentOrder() !== null);

  createNewOrder(data: any) {
    return this.http.post<any>(`http://localhost:5000/api/orders/create-order`, data, { 
      withCredentials: true 
    }).pipe(
      tap(res => {
        if (res.success) {
          this.currentOrder.set(res.data);
        }
      })
    );
  }

  clearOrder() {
    this.currentOrder.set(null);
  }

  checkActiveBooking() {
    return this.http.get<any>(`http://localhost:5000/api/orders/get-orders`, { withCredentials: true })
      .subscribe(res => {
        if (res.success && res.data.length > 0) {
          const active = res.data.find((o: any) => o.status === 'Pending' || o.status === 'Confirmed');
          if (active) this.currentOrder.set(active);
        }
      });
  }

  // Admin method to update status (e.g., 'Cleaning in Progress')
  updateOrderStatus(newStatus: string, billing?: any) {
    this.currentOrder.update(order => ({
      ...order,
      status: newStatus,
      bill: billing ? billing : order.bill
    }));
  }
  private pendingRequests = signal([
    { 
      id: 1, 
      customerName: 'John Doe', 
      phone: '09123456789', 
      service: 'Wash & Fold', 
      pickupDate: '2024-05-20', 
      weight: 5 
    },
    { 
      id: 2, 
      customerName: 'Jane Smith', 
      phone: '09987654321', 
      service: 'Dry Clean', 
      pickupDate: '2024-05-21', 
      weight: 2 
    },
    // ... add more if needed
  ]);

  // Computed signal that automatically updates when pendingRequests changes
  pendingCount = computed(() => this.pendingRequests().length);

  getRequests() {
    return this.pendingRequests;
  }

  removeRequest(id: number) {
    this.pendingRequests.update(reqs => reqs.filter(r => r.id !== id));
  }
}