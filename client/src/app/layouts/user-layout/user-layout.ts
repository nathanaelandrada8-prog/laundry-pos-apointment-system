import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserSidebarComponent } from '../../shared/sidebar/user-sidebar/user-sidebar';
import { LogoutModalComponent } from '../../shared/components/logout-modal/logout-modal';
import { AuthUiService } from '../../core/services/auth-ui.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    UserSidebarComponent,
    LogoutModalComponent
  ],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.scss'
})
export class UserLayoutComponent {
  public authUi = inject(AuthUiService);
  public orderService = inject(OrderService);

  ngOnInit() {
    this.orderService.checkActiveBooking();
  }
}