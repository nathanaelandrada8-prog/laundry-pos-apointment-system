import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../env/env';
import { firstValueFrom, map, tap } from 'rxjs';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  address: {
    streetAddress: string;
    city: string;
    postalCode: string;
    addressNotes: string;
  };
  profilePictureBase64: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(null);
  initialized = signal(false);

  constructor(private http: HttpClient) {}

  bootstrap(): Promise<void> {
    return firstValueFrom(
      this.http.get<{user: User}>('http://localhost:5000/api/me', { withCredentials: true })
    )
    .then(res => this.user.set(res.user))
    .catch(() => this.user.set(null))
    .finally(() => this.initialized.set(true));
  }

  login(dto: LoginDto) {
    return this.http
      .post<{ data: User }>('http://localhost:5000/api/auth/login', dto, { withCredentials: true })
      .pipe(
        tap(res => this.user.set(res.data)),
        map(res => ({ user: res.data }))
      );
  }

  logout() {
    return this.http
      .post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true })
      .subscribe(() => this.user.set(null));
  }

  isProfileComplete = computed(() => {
    const u = this.user();
    return !!(u?.address && u?.phone); 
  });

  updateProfile(profileData: any) {
    return this.http.put<any>(`http://localhost:5000/api/profile`, profileData, { withCredentials: true }).pipe(
      tap((res) => {
        // res contains the updated user object from your controller
        this.user.set(res); 
      })
    );
  }
}