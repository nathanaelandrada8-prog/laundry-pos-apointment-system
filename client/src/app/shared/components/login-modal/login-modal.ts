import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthUiService } from '../../../core/services/auth-ui.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss'
})
export class LoginModalComponent {
  authUi = inject(AuthUiService);
  auth = inject(AuthService);
  router = inject(Router);
  loading = signal(false);
  error = signal<string | null>(null);

  loginData = { email: '', password: '' };

  onLogin() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.loginData).subscribe({
    next: (res) => {
      console.log('Logged in user:', res.user);

      if (res.user.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/user/dashboard']);
      }
    },
    error: err => {
      this.error.set(err.error?.message ?? 'Login failed');
    },
    complete: () => {
      this.loading.set(false);
    }
  });
  }

  close() {
    this.authUi.closeLogin();
  }
  
  switchToSignup() {
    this.authUi.closeLogin();
    this.authUi.openSignup();
  }
}