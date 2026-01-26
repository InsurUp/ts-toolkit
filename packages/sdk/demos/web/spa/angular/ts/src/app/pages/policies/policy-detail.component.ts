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
import type { GetPolicyDetailResult } from '@insurup/contracts';

@Component({
  selector: 'app-policy-detail',
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
    } @else if (policy()) {
      <div class="policy-detail">
        <div class="header">
          <button mat-icon-button (click)="router.navigate(['/policies'])">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>Policy {{ policy()!.insuranceCompanyPolicyNumber || policyId }}</h1>
            <p class="id">ID: {{ policy()!.id }}</p>
          </div>
        </div>

        <div class="cards">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>description</mat-icon>
              <mat-card-title>Policy Information</mat-card-title>
              <mat-card-subtitle>Basic policy details</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Policy Number</span>
                <span>{{ policy()!.insuranceCompanyPolicyNumber || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Branch</span>
                <mat-chip>{{ policy()!.productBranch || '-' }}</mat-chip>
              </div>
              <div class="info-row">
                <span class="label">Product ID</span>
                <span>{{ policy()!.productId || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Status</span>
                <mat-chip>{{ policy()!.state || '-' }}</mat-chip>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>business</mat-icon>
              <mat-card-title>Insurance Company</mat-card-title>
              <mat-card-subtitle>Insurer information</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Company ID</span>
                <span>{{ policy()!.insuranceCompanyId || '-' }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Customer</mat-card-title>
              <mat-card-subtitle>Policyholder information</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Insurer Customer ID</span>
                <span>{{ policy()!.insurerCustomerId || '-' }}</span>
              </div>
              @if (policy()!.insurerCustomerId) {
                <button mat-stroked-button (click)="router.navigate(['/customers', policy()!.insurerCustomerId])">
                  View Customer
                </button>
              }
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>attach_money</mat-icon>
              <mat-card-title>Premium Details</mat-card-title>
              <mat-card-subtitle>Financial information</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Gross Premium</span>
                <span class="premium">{{ formatCurrency(policy()!.grossPremium) }}</span>
              </div>
              @if (policy()!.netPremium !== undefined) {
                <div class="info-row">
                  <span class="label">Net Premium</span>
                  <span>{{ formatCurrency(policy()!.netPremium) }}</span>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>calendar_today</mat-icon>
              <mat-card-title>Coverage Period</mat-card-title>
              <mat-card-subtitle>Policy validity dates</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="info-row">
                <span class="label">Start Date</span>
                <span>{{ formatDate(policy()!.startDate) }}</span>
              </div>
              <div class="info-row">
                <span class="label">End Date</span>
                <span>{{ formatDate(policy()!.endDate) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Created At</span>
                <span>{{ formatDate(policy()!.createdAt) }}</span>
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
    .policy-detail .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .policy-detail h1 {
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
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 12px;
    }
    .label {
      font-weight: 500;
    }
    .premium {
      font-weight: bold;
    }
  `],
})
export class PolicyDetailComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  policy = signal<GetPolicyDetailResult | null>(null);
  isLoading = signal(true);
  policyId = '';

  async ngOnInit(): Promise<void> {
    this.policyId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.policyId) {
      this.router.navigate(['/policies']);
      return;
    }

    try {
      const result = await this.clientService.policies.getPolicyDetail({ policyId: this.policyId });
      if (result.isSuccess) {
        this.policy.set(result.data);
      } else {
        this.snackBar.open('Failed to load policy', 'Close', { duration: 3000 });
        this.router.navigate(['/policies']);
      }
    } catch (error) {
      this.snackBar.open('An error occurred', 'Close', { duration: 3000 });
      console.error(error);
      this.router.navigate(['/policies']);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
  }
}
