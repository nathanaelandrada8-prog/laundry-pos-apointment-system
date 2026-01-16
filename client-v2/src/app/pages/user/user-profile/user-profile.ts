import { AuthService } from './../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {
  authService = inject(AuthService);
  loading = false;
  successMessage = '';

  profileData = {
    firstName: '',
    lastName: '',
    phone: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    addressNotes: '',
    profilePictureBase64: ''
  };

  ngOnInit() {
    const u = this.authService.user();
    if (u) {
      this.profileData = {
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        phone: u.phone || '',
        streetAddress: u.address?.streetAddress || '',
        city: u.address?.city || '',
        postalCode: u.address?.postalCode || '',
        addressNotes: u.address?.addressNotes || '',
        profilePictureBase64: u.profilePictureBase64 || ''
      };
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileData.profilePictureBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.loading = true;
    this.authService.updateProfile(this.profileData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => (this.loading = false)
    });
  }
}
