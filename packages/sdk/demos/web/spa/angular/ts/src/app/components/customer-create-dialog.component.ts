import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../services/client.service';
import { CustomerType } from '@insurup/contracts';

@Component({
  selector: 'app-customer-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Create Customer</h2>
    <mat-dialog-content>
      <p class="dialog-description">Add a new individual customer to the system.</p>
      
      <form class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Full Name *</mat-label>
          <input matInput [(ngModel)]="fullName" name="fullName" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Identity Number (TC Kimlik No)</mat-label>
          <input matInput [(ngModel)]="identityNumber" name="identityNumber" maxlength="11">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Birth Date</mat-label>
          <input matInput type="date" [(ngModel)]="birthDate" name="birthDate">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email Address</mat-label>
          <input matInput type="email" [(ngModel)]="email" name="email">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Phone Number</mat-label>
          <input matInput [(ngModel)]="phoneNumber" name="phoneNumber" maxlength="10">
          <mat-hint>Enter 10-digit phone number without country code</mat-hint>
        </mat-form-field>

        @if (error()) {
          <p class="error-message">{{ error() }}</p>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isPending()">Cancel</button>
      <button mat-raised-button color="primary" 
              (click)="submit()" 
              [disabled]="isPending() || !fullName">
        {{ isPending() ? 'Creating...' : 'Create Customer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-description {
      margin-bottom: 16px;
      opacity: 0.7;
    }
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 400px;
    }
    .full-width {
      width: 100%;
    }
    .error-message {
      color: var(--mat-warn-color);
    }
  `],
})
export class CustomerCreateDialogComponent {
  private dialogRef = inject(MatDialogRef<CustomerCreateDialogComponent>);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  fullName = '';
  identityNumber = '';
  birthDate = '';
  email = '';
  phoneNumber = '';

  isPending = signal(false);
  error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.isPending.set(true);
    this.error.set(null);

    try {
      const result = await this.clientService.customers.createCustomer({
        type: CustomerType.Individual,
        fullName: this.fullName,
        email: this.email || undefined,
        phoneNumber: this.phoneNumber
          ? { countryCode: 90, number: this.phoneNumber }
          : undefined,
        identityNumber: this.identityNumber || '',
        birthDate: this.birthDate || undefined,
        fillMissingFields: false,
      });

      if (result.isSuccess) {
        this.snackBar.open('Customer created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
        this.router.navigate(['/customers', result.data.id]);
      } else {
        this.error.set('Failed to create customer');
        this.snackBar.open('Failed to create customer', 'Close', { duration: 3000 });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      this.error.set(errorMessage);
      this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
    } finally {
      this.isPending.set(false);
    }
  }
}
