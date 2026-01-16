import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthUiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-logout-modal',
  imports: [CommonModule],
  templateUrl: './logout-modal.html',
  styleUrl: './logout-modal.scss',
})
export class LogoutModal {
  private authUi = inject(AuthUiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  close() {
    this.authUi.closeLogout();
  }

  confirmLogout() {
    this.authUi.closeLogout();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}