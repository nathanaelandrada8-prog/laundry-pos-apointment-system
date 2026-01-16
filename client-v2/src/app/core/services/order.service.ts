import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../env';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/api/orders`;

    currentOrder = signal<any>(null);
    pendingOrders = signal<any[]>([]);
    hasActiveBooking = computed(() => this.currentOrder() !== null);
    pendingCount = computed(() => this.pendingOrders().length);

    createNewOrder(data: any) {
        return this.http.post<any>(`${this.API_URL}/create-order`, data)
        .pipe(
            tap(res => {
                if (res.success) {
                this.currentOrder.set(res.data);
                }
            })
        );
    }

    checkActiveBooking() {
      return this.http.get<any>(`${this.API_URL}/get-orders`)
        .subscribe(res => {
          if (res.success && res.data.length > 0) {
            const order = res.data[0];

            // If the order is already completed, move it to history immediately
            if (order.status === 'Completed') {
              this.moveToHistory(order._id);
            } else {
              // Otherwise, show it in the tracking page
              this.currentOrder.set(order);
              this.pendingOrders.set(res.data);
            }
          } else {
            this.currentOrder.set(null);
          }
        });
    }

    moveToHistory(orderId: string) {
      this.http.post<any>(`${this.API_URL}/move-to-history/${orderId}`, {})
        .subscribe({
          next: (res) => {
            if (res.success) {
              console.log('Order archived successfully');
              this.currentOrder.set(null); // This clears the user's track page
            }
          },
          error: (err) => console.error('Migration failed', err)
        });
    }

    updateOrderStatus(id: string, status: string, bill?: any) {
      const payload: any = { status };
      if (bill) payload.bill = bill;
      return this.http.put<any>(`${this.API_URL}/update-order/${id}`, payload)
        .pipe(
          tap(res => {
            if (res.success) {
              this.pendingOrders.update(orders =>
                orders.map(o => o._id === id ? res.data : o)
              );
            } else {
              alert(res.message);
            }
          })
        );
    }

    removeRequest(id: number) {
      this.pendingOrders.update(reqs => reqs.filter(r => r.id !== id));
    }
}
