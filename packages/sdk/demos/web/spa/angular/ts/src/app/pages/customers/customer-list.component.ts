import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import type { QueryCustomerModelUnifiedFilterInput } from '@insurup/sdk';
import { ClientService } from '../../services/client.service';
import { DataTableComponent, type Column } from '../../components/data-table.component';
import { PaginationComponent } from '../../components/pagination.component';
import { CustomerCreateDialogComponent } from '../../components/customer-create-dialog.component';

interface Customer {
  id: string;
  name: string | null;
  type: string;
  primaryEmail: string | null;
  primaryPhoneNumber: string | null;
  createdAt: string;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    DataTableComponent,
    PaginationComponent,
  ],
  template: `
    <div class="customer-list">
      <div class="header">
        <div>
          <h1>Customers</h1>
          <p class="subtitle">Manage customer records and information.</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          New Customer
        </button>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search customers</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="search" (ngModelChange)="onSearch($event)" />
      </mat-form-field>

      <app-data-table
        [columns]="columns"
        [data]="customers()"
        [isLoading]="isLoading()"
        [sortField]="sortField()"
        [sortDirection]="sortDirection()"
        (sort)="onSort($event)"
        (rowClick)="onRowClick($event)"
      >
        <ng-template #cellTemplate let-item let-column="column">
          @if (column.key === 'type') {
            <mat-chip>{{ item.type }}</mat-chip>
          } @else if (column.render) {
            {{ column.render(item) }}
          } @else {
            {{ item[column.key] ?? '-' }}
          }
        </ng-template>
      </app-data-table>

      <app-pagination
        [hasNextPage]="pageInfo().hasNextPage"
        [hasPreviousPage]="pageInfo().hasPreviousPage"
        [isLoading]="isLoading()"
        [totalCount]="totalCount()"
        [currentPage]="currentPage()"
        [pageSize]="10"
        (next)="onNextPage()"
        (previous)="onPreviousPage()"
      >
      </app-pagination>
    </div>
  `,
  styles: [
    `
      .customer-list h1 {
        font-size: 30px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .subtitle {
        opacity: 0.7;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .search-field {
        width: 100%;
        max-width: 400px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class CustomerListComponent {
  private router = inject(Router);
  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  customers = signal<Customer[]>([]);
  isLoading = signal(true);
  totalCount = signal<number | null>(null);
  pageInfo = signal({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null as string | null,
    endCursor: null as string | null,
  });

  search = '';
  sortField = signal('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');
  cursor = signal<string | null>(null);
  direction = signal('forward');
  currentPage = signal(1);

  columns: Column<Customer>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (c) => c.name || '-' },
    { key: 'type', header: 'Type' },
    { key: 'primaryEmail', header: 'Email', render: (c) => c.primaryEmail || '-' },
    { key: 'primaryPhoneNumber', header: 'Phone', render: (c) => c.primaryPhoneNumber || '-' },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (c) => new Date(c.createdAt).toLocaleDateString(),
    },
  ];

  constructor() {
    effect(() => {
      this.fetchCustomers();
    });
  }

  async fetchCustomers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const filterOptions: QueryCustomerModelUnifiedFilterInput | undefined = this.search
        ? { name: { $search: true, textSearch: { value: this.search } } }
        : undefined;

      const countPromise = this.clientService.customers.getCustomers({
        first: 1,
        filter: filterOptions,
        select: ['id'] as const,
        includeTotalCount: true,
      });

      const result = await this.clientService.customers.getCustomers({
        select: ['id', 'name', 'type', 'primaryEmail', 'primaryPhoneNumber', 'createdAt'] as const,
        first: this.direction() === 'forward' ? 10 : undefined,
        last: this.direction() === 'backward' ? 10 : undefined,
        after: this.direction() === 'forward' ? this.cursor() : undefined,
        before: this.direction() === 'backward' ? this.cursor() : undefined,
        filter: filterOptions,
        order: this.sortField()
          ? [{ [this.sortField()]: this.sortDirection() === 'asc' ? 'ASC' : 'DESC' }]
          : undefined,
        includeTotalCount: false,
      });

      if (result.isSuccess) {
        const nodes =
          result.data.nodes?.filter((n): n is NonNullable<typeof n> => n !== null) ?? [];
        this.customers.set(
          nodes.map((n) => ({
            id: n.id,
            name: n.name ?? null,
            type: String(n.type),
            primaryEmail: n.primaryEmail ?? null,
            primaryPhoneNumber: n.primaryPhoneNumber ?? null,
            createdAt: String(n.createdAt),
          }))
        );
        this.pageInfo.set({
          hasNextPage: result.data.pageInfo.hasNextPage,
          hasPreviousPage: result.data.pageInfo.hasPreviousPage,
          startCursor: result.data.pageInfo.startCursor ?? null,
          endCursor: result.data.pageInfo.endCursor ?? null,
        });

        countPromise.then((countRes) => {
          if (countRes.isSuccess && countRes.data?.totalCount != null) {
            this.totalCount.set(countRes.data.totalCount);
          }
        });
      } else {
        this.snackBar.open('Failed to load customers', 'Close', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('An error occurred', 'Close', { duration: 3000 });
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch(_value: string): void {
    this.cursor.set(null);
    this.direction.set('forward');
    this.currentPage.set(1);
    this.totalCount.set(null);
    this.fetchCustomers();
  }

  onSort(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
    this.cursor.set(null);
    this.direction.set('forward');
    this.currentPage.set(1);
    this.fetchCustomers();
  }

  onNextPage(): void {
    const pi = this.pageInfo();
    if (pi.endCursor) {
      this.cursor.set(pi.endCursor);
      this.direction.set('forward');
      this.currentPage.update((p) => p + 1);
      this.fetchCustomers();
    }
  }

  onPreviousPage(): void {
    const pi = this.pageInfo();
    if (pi.startCursor) {
      this.cursor.set(pi.startCursor);
      this.direction.set('backward');
      this.currentPage.update((p) => Math.max(1, p - 1));
      this.fetchCustomers();
    }
  }

  onRowClick(customer: Customer): void {
    this.router.navigate(['/customers', customer.id]);
  }

  openCreateDialog(): void {
    this.dialog.open(CustomerCreateDialogComponent, {
      width: '500px',
    });
  }
}
