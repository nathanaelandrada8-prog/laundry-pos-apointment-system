import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthUiService } from '../../../core/services/auth-ui.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup-modal.html',
  styleUrl: './signup-modal.scss'
})
export class SignupModalComponent {
  authUi = inject(AuthUiService);
  auth = inject(AuthService);

  signupData = {
    fname: '',
    lname: '',
    email: '',
    password: ''
  };

  onSignup() {
    // this.auth.register(this.signupData).subscribe({
    //   next: res => {
    //     this.auth.setSession(res);
    //     this.authUi.closeSignup();
    //   },
    //   error: err => console.error('Signup error:', err)
    // })
  }

  close() {
    this.authUi.closeSignup();
  }

  switchToLogin() {
    this.authUi.closeSignup();
    this.authUi.openLogin();
  }
}