import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthUiService } from '../../core/services/ui.service';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})

export class Sidebar {
  private authUiService = inject(AuthUiService);
  menuOpen = signal(false);
  @Input() menuItems: MenuItem[] = [];

  onLogout() {
    this.authUiService.openLogout();
  }
  
  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }
}
