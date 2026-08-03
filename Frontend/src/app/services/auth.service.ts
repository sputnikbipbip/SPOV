import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'spov_token';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.baseUrl}/api/auth/login`, { email, password })
    );
    localStorage.setItem(TOKEN_KEY, res.accessToken);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  async getCurrentUser(): Promise<CurrentUser | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      return await firstValueFrom(
        this.http.get<CurrentUser>(`${this.baseUrl}/api/me`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
        })
      );
    } catch {
      return null;
    }
  }
}
