import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="profile">
      <h1>Profile</h1>
      <p class="subtitle">View your account information and session details.</p>

      <div class="cards">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>Account Information</mat-card-title>
            <mat-card-subtitle>Your profile details from the identity provider.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (claims?.['name']) {
              <div class="info-row">
                <mat-icon>person</mat-icon>
                <span class="label">Name:</span>
                <span>{{ claims?.['name'] }}</span>
              </div>
            }
            @if (claims?.['email']) {
              <div class="info-row">
                <mat-icon>email</mat-icon>
                <span class="label">Email:</span>
                <span>{{ claims?.['email'] }}</span>
              </div>
            }
            @if (claims?.['email_verified'] !== undefined) {
              <div class="info-row">
                <span class="label">Email Verified:</span>
                <mat-chip [highlighted]="claims?.['email_verified']">
                  {{ claims?.['email_verified'] ? 'Yes' : 'No' }}
                </mat-chip>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>schedule</mat-icon>
            <mat-card-title>Session</mat-card-title>
            <mat-card-subtitle>Current authentication session details.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info-row">
              <span class="label">Status:</span>
              <mat-chip highlighted>Authenticated</mat-chip>
            </div>
            @if (claims?.['iat']) {
              <div class="info-row">
                <span class="label">Issued At:</span>
                <span>{{ formatDate(claims?.['iat']) }}</span>
              </div>
            }
            @if (claims?.['exp']) {
              <div class="info-row">
                <span class="label">Expires:</span>
                <span>{{ formatDate(claims?.['exp']) }}</span>
              </div>
            }
            <button mat-raised-button color="warn" (click)="authService.logout()">
              <mat-icon>logout</mat-icon>
              Sign Out
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      @if (authService.accessToken) {
        <mat-card class="token-card">
          <mat-card-header>
            <mat-card-title>Access Token</mat-card-title>
            <mat-card-subtitle>The current access token (truncated for display).</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <code class="token-display">
              {{ authService.accessToken.slice(0, 50) }}...{{ authService.accessToken.slice(-20) }}
            </code>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .profile h1 {
        font-size: 30px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .subtitle {
        opacity: 0.7;
        margin-bottom: 24px;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }
      .info-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      .info-row mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.7;
      }
      .label {
        font-weight: 500;
      }
      .token-card {
        margin-top: 16px;
      }
      .token-display {
        display: block;
        padding: 16px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        word-break: break-all;
        font-size: 14px;
      }
    `,
  ],
})
export class ProfileComponent {
  authService = inject(AuthService);

  get claims(): Record<string, unknown> | null {
    return this.authService.idTokenClaims;
  }

  formatDate(timestamp: unknown): string {
    if (typeof timestamp !== 'number') return '-';
    return new Date(timestamp * 1000).toLocaleString();
  }
}
