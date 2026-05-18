import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { AuthConfig } from 'angular-oauth2-oidc';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private router = inject(Router);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private loginInProgressSubject = new BehaviorSubject<boolean>(false);
  loginInProgress$ = this.loginInProgressSubject.asObservable();

  constructor() {
    this.configureOAuth();
  }

  private configureOAuth(): void {
    const authConfig: AuthConfig = {
      issuer: environment.authServer,
      redirectUri: window.location.origin + '/callback',
      clientId: environment.clientId,
      scope: environment.scopes,
      responseType: 'code',
      showDebugInformation: !environment.production,
      useSilentRefresh: true,
      silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
      strictDiscoveryDocumentValidation: false,
      tokenEndpoint: `${environment.authServer}connect/token`,
      loginUrl: `${environment.authServer}connect/authorize`,
      logoutUrl: `${environment.authServer}connect/endsession`,
      requireHttps: environment.production,
    };

    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    // Check if we have a valid token on startup
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    const hasValidToken = this.oauthService.hasValidAccessToken();
    this.isAuthenticatedSubject.next(hasValidToken);
  }

  get isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  get accessToken(): string | null {
    return this.oauthService.getAccessToken() || null;
  }

  get idTokenClaims(): Record<string, unknown> | null {
    const claims = this.oauthService.getIdentityClaims();
    return (claims as Record<string, unknown>) || null;
  }

  async login(): Promise<void> {
    this.loginInProgressSubject.next(true);
    try {
      await this.oauthService.loadDiscoveryDocumentAndLogin();
    } catch {
      // Fallback to initCodeFlow if discovery fails
      this.oauthService.initCodeFlow();
    }
  }

  async handleCallback(): Promise<boolean> {
    this.loginInProgressSubject.next(true);
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      const authenticated = this.oauthService.hasValidAccessToken();
      this.isAuthenticatedSubject.next(authenticated);
      this.loginInProgressSubject.next(false);
      return authenticated;
    } catch (error) {
      console.error('Callback error:', error);
      this.loginInProgressSubject.next(false);
      return false;
    }
  }

  logout(): void {
    this.oauthService.logOut();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.oauthService.hasValidAccessToken()) {
      return null;
    }
    return this.oauthService.getAccessToken() || null;
  }
}
