import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthUiService {
  isLoginVisible = signal(false);
  isSignupVisible = signal(false);
  isLogoutVisible = signal(false);

  openLogin() { this.isLoginVisible.set(true); }
  closeLogin() { this.isLoginVisible.set(false); }

  openLogout() { this.isLogoutVisible.set(true); }
  closeLogout() { this.isLogoutVisible.set(false); }

  openSignup() { this.isSignupVisible.set(true); }
  closeSignup() { this.isSignupVisible.set(false); }
}