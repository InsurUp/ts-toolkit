import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../services/auth.service';

const THEME_KEY = 'insurup-demo-theme';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar class="header">
      <a routerLink="/" class="logo">
        <span class="font-bold">InsurUp SDK Demo</span>
      </a>

      @if (authService.isAuthenticated) {
        <nav class="nav-links">
          <a routerLink="/customers" routerLinkActive="active">Customers</a>
          <a routerLink="/policies" routerLinkActive="active">Policies</a>
        </nav>
      }

      <span class="spacer"></span>

      <button mat-icon-button (click)="toggleTheme()" aria-label="Toggle theme">
        <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      @if (authService.isAuthenticated) {
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <a mat-menu-item routerLink="/profile"> Profile </a>
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-menu>
      } @else {
        <button mat-raised-button color="primary" (click)="authService.login()">Login</button>
      }
    </mat-toolbar>
  `,
  styles: [
    `
      .header {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: var(--mat-toolbar-container-background-color);
      }
      .logo {
        text-decoration: none;
        color: inherit;
        margin-right: 24px;
      }
      .nav-links {
        display: flex;
        gap: 24px;
      }
      .nav-links a {
        text-decoration: none;
        color: inherit;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      .nav-links a:hover,
      .nav-links a.active {
        opacity: 1;
      }
      .spacer {
        flex: 1 1 auto;
      }
    `,
  ],
})
export class HeaderComponent {
  authService = inject(AuthService);
  isDark = signal(this.getInitialTheme());

  constructor() {
    effect(() => {
      if (this.isDark()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(THEME_KEY, this.isDark() ? 'dark' : 'light');
    });
  }

  private getInitialTheme(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme(): void {
    this.isDark.set(!this.isDark());
  }
}
