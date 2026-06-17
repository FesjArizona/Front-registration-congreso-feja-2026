import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, tap, throwError } from 'rxjs';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'admin_sport' | 'referee' | 'viewer';
    sport: 'soccer' | 'volleyball' | 'basketball' | null;
}

interface LoginResponse {
    token: string;
    user: AuthUser;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // ── Login Mock Temporal ───────────────────────────────────────────────────
  login(email: string, password: string): Observable<LoginResponse> {
    // Definimos las credenciales simuladas obligatorias
    const VALID_EMAIL = 'admin@congreso.com';
    const VALID_PASSWORD = 'admin123';

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      const mockResponse: LoginResponse = {
        token: 'jwt_mock_token_12345',
        user: {
          id: 1,
          name: 'Webmaster Admin',
          email: email,
          role: 'admin',
          sport: null,
        },
      };

      return of(mockResponse).pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          this.userSubject.next(response.user);
        }),
      );
    } else {
      // Si no coinciden, simulamos un error del servidor (status 401)
      return throwError(() => ({
        status: 401,
        error: {
          error:
            'Credenciales incorrectas. Intenta con admin@congreso.com y admin123',
        },
      }));
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Verifica si el usuario tiene acceso a un deporte específico
  // Admin general (sport = null) tiene acceso a todo
  canAccessSport(sport: 'soccer' | 'volleyball' | 'basketball'): boolean {
    const user = this.getUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.sport === sport;
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
