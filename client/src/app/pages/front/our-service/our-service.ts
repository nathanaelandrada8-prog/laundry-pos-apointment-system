import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUiService } from '../../../core/services/auth-ui.service';

@Component({
  selector: 'app-our-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './our-service.html',
  styleUrl: './our-service.scss'
})
export class OurService {
  public authUi = inject(AuthUiService);
}