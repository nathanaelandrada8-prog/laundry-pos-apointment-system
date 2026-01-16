import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthUiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-modal.html',
  styleUrl: './register-modal.scss'
})
export class SignupModalComponent {
  authUi = inject(AuthUiService);
  authService = inject(AuthService);
  private router = inject(Router);
  isLoading = false;

  signupData = {
    fname: '',
    lname: '',
    email: '',
    password: ''
  };

  onSignup(form: any) {
    if (form.invalid) {
        Object.values(form.controls).forEach((control: any) => {
          control.markAsTouched();
        });
        return;
    }
    this.isLoading = true;
    this.authService.signup(this.signupData).subscribe({
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
        alert(err.error?.message || 'Registration failed.');
      }
    });
  }

  close() {
    this.authUi.closeSignup();
  }

  switchToLogin() {
    this.authUi.closeSignup();
    this.authUi.openLogin();
  }
}