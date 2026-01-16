import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthUiService } from '../../core/services/auth-ui.service';
import { LoginModalComponent } from '../../shared/components/login-modal/login-modal';
import { SignupModalComponent } from '../../shared/components/signup-modal/signup-modal';

@Component({
  selector: 'app-front-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginModalComponent, SignupModalComponent],
  templateUrl: './front-layout.html',
  styleUrl: './front-layout.scss'
})
export class FrontLayoutComponent {
  // We make this public so the HTML template can see it
  public authUi = inject(AuthUiService);
}