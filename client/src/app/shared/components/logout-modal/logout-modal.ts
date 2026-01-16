import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUiService } from '../../../core/services/auth-ui.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout-modal.html',
  styleUrl: './logout-modal.scss'
})
export class LogoutModalComponent {
  private authUi = inject(AuthUiService);
  private auth = inject(AuthService);

  close() {
    this.authUi.closeLogout();
  }

  confirmLogout() {
    this.auth.logout();
    this.close();
  }
}