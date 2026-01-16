import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthUiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss'
})
export class LoginModalComponent {
  authUi = inject(AuthUiService);
  authService = inject(AuthService);
  private router = inject(Router);

  loginData = { email: '', password: '' };
  isLoading = false;

  onLogin(form: any) {
    if (form.invalid) {
        Object.values(form.controls).forEach((control: any) => {
          control.markAsTouched();
        });
        return;
    }
    this.isLoading = true;
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.close();
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'Login failed.');
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