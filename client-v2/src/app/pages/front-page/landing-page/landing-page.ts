import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUiService } from '../../../core/services/ui.service';
import { SignupModalComponent } from '../../../components/register-modal/register-modal';
import { LoginModalComponent } from '../../../components/login-modal/login-modal';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, LoginModalComponent, SignupModalComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  protected authUiService = inject(AuthUiService);

  openAuth(){
    this.authUiService.openLogin();
  }

  onSubmit(){
    console.log('submit');
  }
}
