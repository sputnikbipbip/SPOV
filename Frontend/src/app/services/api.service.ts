import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly baseUrl = environment.apiUrl;

  constructor(protected readonly http: HttpClient) {}

  protected async get<T>(path: string): Promise<T> {
    try {
      return await firstValueFrom(this.http.get<T>(`${this.baseUrl}${path}`));
    } catch (e) {
      throw this.handleError(e);
    }
  }

  protected async post<T>(path: string, body: unknown): Promise<T> {
    try {
      return await firstValueFrom(this.http.post<T>(`${this.baseUrl}${path}`, body));
    } catch (e) {
      throw this.handleError(e);
    }
  }

  private handleError(e: unknown): Error {
    if (e instanceof HttpErrorResponse) {
      const msg = e.error?.error ?? e.statusText ?? 'Erro de comunicação com o servidor.';
      return new Error(msg);
    }
    return new Error('Erro de comunicação com o servidor.');
  }
}
