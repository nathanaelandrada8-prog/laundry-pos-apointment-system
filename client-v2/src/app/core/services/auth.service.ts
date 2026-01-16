import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../../env';
import { loginData, signupData } from './../interfaces/auth.interface';
import { User, profileData } from './../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api`;

  user = signal<User | null>(null);
  initialized = signal(false);

  async bootstrap(): Promise<void> {
    try {
      try {
        const res = await firstValueFrom(
          this.http.get<{ user: User; }>(`${this.API_URL}/me`)
        );
        return this.user.set(res.user);
      } catch {
        return this.user.set(null);
      }
    } finally {
      return this.initialized.set(true);
    }
  }

  login(dto: loginData) {
    return this.http
      .post<{ data: User }>(`${this.API_URL}/auth/login`, dto)
      .pipe(
        tap(res => this.user.set(res.data)),
        map(res => ({ user: res.data }))
      );
  }

  signup(dto: signupData){
    return this.http.post<{ data: User }>(`${this.API_URL}/auth/signup`, dto)
    .pipe(
      tap(res => this.user.set(res.data)),
      map(res => ({ user: res.data }))
    );
  }

  logout() {
    return this.http
      .post(`${this.API_URL}/auth/logout`, {})
      .subscribe(() => this.user.set(null));
  }

  updateProfile(profileData: profileData) {
    return this.http.put<any>(`${this.API_URL}/profile`, profileData)
    .pipe(
      tap((res) => {
        this.user.set(res);
      })
    );
  }

  isProfileComplete = computed(() => {
    const u = this.user();
    return !!(u?.address && u?.phone);
  });
}
