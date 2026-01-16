import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../shared/sidebar/admin-sidebar/admin-sidebar';
import { LogoutModalComponent } from '../../shared/components/logout-modal/logout-modal';
import { AuthUiService } from '../../core/services/auth-ui.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminSidebarComponent,
    LogoutModalComponent
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent {
  public authUi = inject(AuthUiService);
}
