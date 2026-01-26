import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../services/client.service';
import { CustomerType, type GetCustomerResult } from '@insurup/contracts';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    @if (isLoading()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (customer()) {
      <div class="customer-detail">
        <div class="header">
          <button mat-icon-button (click)="router.navigate(['/customers'])">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>{{ getCustomerName() }}</h1>
            <p class="id">ID: {{ customer()!.id }}</p>
          </div>
        </div>

        <div class="cards">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Basic Information</mat-card-title>
              <mat-card-subtitle>Customer profile details</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Type</span>
                <mat-chip>{{ customer()!.type }}</mat-chip>
              </div>
              @if (customer()!.type === CustomerType.Individual) {
                <div class="info-row">
                  <span class="label">Full Name</span>
                  <span>{{ getProperty('fullName') || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Birth Date</span>
                  <span>{{ formatDate(getProperty('birthDate')) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Gender</span>
                  <span>{{ getProperty('gender') || '-' }}</span>
                </div>
              }
              @if (customer()!.type === CustomerType.Company) {
                <div class="info-row">
                  <span class="label">Company Title</span>
                  <span>{{ getProperty('title') || '-' }}</span>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>email</mat-icon>
              <mat-card-title>Contact Information</mat-card-title>
              <mat-card-subtitle>Email and phone details</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <mat-icon>email</mat-icon>
                <span class="label">Primary Email:</span>
                <span>{{ customer()!.primaryEmail || '-' }}</span>
              </div>
              <div class="info-row">
                <mat-icon>phone</mat-icon>
                <span class="label">Primary Phone:</span>
                <span>{{ formatPhoneNumber(customer()!.primaryPhoneNumber) }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>calendar_today</mat-icon>
              <mat-card-title>Timeline</mat-card-title>
              <mat-card-subtitle>Important dates</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Created</span>
                <span>{{ formatDate(customer()!.createdAt) }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 50vh;
    }
    .customer-detail .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .customer-detail h1 {
      font-size: 30px;
      font-weight: bold;
      margin: 0;
    }
    .id {
      font-family: monospace;
      opacity: 0.7;
      font-size: 14px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 16px;
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
  `],
})
export class CustomerDetailComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  CustomerType = CustomerType;
  customer = signal<GetCustomerResult | null>(null);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/customers']);
      return;
    }

    try {
      const result = await this.clientService.customers.getCustomer(id);
      if (result.isSuccess) {
        this.customer.set(result.data);
      } else {
        this.snackBar.open('Failed to load customer', 'Close', { duration: 3000 });
        this.router.navigate(['/customers']);
      }
    } catch (error) {
      this.snackBar.open('An error occurred', 'Close', { duration: 3000 });
      console.error(error);
      this.router.navigate(['/customers']);
    } finally {
      this.isLoading.set(false);
    }
  }

  getCustomerName(): string {
    const c = this.customer();
    if (!c) return '';
    if (c.type === CustomerType.Company) {
      return (c as { title?: string }).title || 'Unknown Company';
    }
    return (c as { fullName?: string }).fullName || 'Unknown';
  }

  getProperty(key: string): unknown {
    const c = this.customer();
    if (!c) return undefined;
    return (c as unknown as Record<string, unknown>)[key];
  }

  formatPhoneNumber(phone: unknown): string {
    if (!phone) return '-';
    if (typeof phone === 'string') return phone;
    if (typeof phone === 'object' && phone !== null) {
      const p = phone as { countryCode?: number; number?: string };
      return p.countryCode && p.number ? `+${p.countryCode} ${p.number}` : '-';
    }
    return '-';
  }

  formatDate(date: unknown): string {
    if (!date) return '-';
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return '-';
  }
}
