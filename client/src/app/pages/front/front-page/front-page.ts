import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUiService } from '../../../core/services/auth-ui.service';

@Component({
  selector: 'app-front-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './front-page.html',
  styleUrl: './front-page.scss'
})

export class FrontPageComponent {
  private authUiService = inject(AuthUiService);

  openAuth() {
    this.authUiService.openLogin();
  }
}
