import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createInsurUpAuth } from '@insurup/sdk';
import type { InsurUpAuth, OAuthTokens, TokenStorage } from '@insurup/sdk';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_STORAGE_KEY = 'insurup-demo-auth-tokens';
const PKCE_STORAGE_KEY = 'insurup-demo-auth-pkce';

interface PkceState {
  readonly codeVerifier: string;
  readonly state: string;
}

/**
 * A {@link TokenStorage} backed by `localStorage` so the OAuth session survives
 * page reloads.
 */
function createLocalStorageTokenStorage(): TokenStorage {
  return {
    get(): OAuthTokens | null {
      const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as OAuthTokens;
      } catch {
        return null;
      }
    },
    set(tokens: OAuthTokens): void {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    },
    clear(): void {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    },
  };
}

/** Decodes the payload of a JWT without verifying its signature. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);

  readonly auth: InsurUpAuth = createInsurUpAuth({
    clientId: environment.clientId,
    authServer: environment.authServer,
    scopes: environment.scopes.split(' ').filter(Boolean),
    storage: createLocalStorageTokenStorage(),
  });

  private readonly redirectUri = window.location.origin + '/callback';

  /** Reactive authentication flag, bridged from the SDK auth state. */
  readonly isAuthenticatedSignal = signal(this.auth.getState().isAuthenticated);

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.auth.getState().isAuthenticated
  );
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly loginInProgressSubject = new BehaviorSubject<boolean>(false);
  readonly loginInProgress$ = this.loginInProgressSubject.asObservable();

  private tokens: OAuthTokens | null = this.auth.getState().tokens;

  constructor() {
    this.auth.subscribe((state) => {
      this.tokens = state.tokens;
      this.isAuthenticatedSignal.set(state.isAuthenticated);
      this.isAuthenticatedSubject.next(state.isAuthenticated);
    });
  }

  get isAuthenticated(): boolean {
    return this.auth.getState().isAuthenticated;
  }

  get accessToken(): string | null {
    return this.tokens?.accessToken ?? null;
  }

  get idTokenClaims(): Record<string, unknown> | null {
    const idToken = this.tokens?.idToken;
    return idToken ? decodeJwtPayload(idToken) : null;
  }

  async login(): Promise<void> {
    this.loginInProgressSubject.next(true);
    const { url, codeVerifier, state } = await this.auth.getAuthorizeUrl({
      redirectUri: this.redirectUri,
    });
    const pkce: PkceState = { codeVerifier, state };
    sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(pkce));
    window.location.assign(url);
  }

  async handleCallback(): Promise<boolean> {
    this.loginInProgressSubject.next(true);
    try {
      const raw = sessionStorage.getItem(PKCE_STORAGE_KEY);
      if (!raw) {
        return false;
      }
      const pkce = JSON.parse(raw) as PkceState;
      const result = await this.auth.exchangeCode({
        callbackUrl: window.location.href,
        redirectUri: this.redirectUri,
        codeVerifier: pkce.codeVerifier,
        state: pkce.state,
      });
      sessionStorage.removeItem(PKCE_STORAGE_KEY);
      return result.isSuccess;
    } catch (error) {
      console.error('Callback error:', error);
      return false;
    } finally {
      this.loginInProgressSubject.next(false);
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/']);
  }

  async getAccessToken(): Promise<string | null> {
    return this.auth.getAccessToken();
  }
}
