import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    @if (!authService.isAuthenticated) {
      <div class="landing">
        <mat-icon class="landing-icon">security</mat-icon>
        <h1 class="landing-title">InsurUp SDK Demo</h1>
        <p class="landing-description">
          An Angular SPA demonstrating the InsurUp SDK for insurance platform integration.
        </p>
        <button mat-raised-button color="primary" (click)="authService.login()">
          Sign in to get started
        </button>
      </div>
    } @else {
      <div class="dashboard">
        <h1>Dashboard</h1>
        <p class="subtitle">Welcome to the InsurUp SDK Demo. Explore customers and policies.</p>

        <div class="cards">
          <mat-card class="dashboard-card" (click)="router.navigate(['/customers'])">
            <mat-card-header>
              <mat-card-title>Customers</mat-card-title>
              <mat-icon mat-card-avatar>people</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <p>View and manage customer records. Create new customers, search, and filter.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="dashboard-card" (click)="router.navigate(['/policies'])">
            <mat-card-header>
              <mat-card-title>Policies</mat-card-title>
              <mat-icon mat-card-avatar>description</mat-icon>
            </mat-card-header>
            <mat-card-content>
              <p>Browse insurance policies. View details, coverage, and status information.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .landing {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 70vh;
        text-align: center;
      }
      .landing-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 24px;
        color: var(--mat-primary-color);
      }
      .landing-title {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 16px;
      }
      .landing-description {
        font-size: 18px;
        opacity: 0.7;
        margin-bottom: 32px;
        max-width: 400px;
      }
      .dashboard h1 {
        font-size: 30px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .subtitle {
        opacity: 0.7;
        margin-bottom: 32px;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }
      .dashboard-card {
        cursor: pointer;
        transition: background 0.2s;
      }
      .dashboard-card:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    `,
  ],
})
export class HomeComponent {
  authService = inject(AuthService);
  router = inject(Router);
}
