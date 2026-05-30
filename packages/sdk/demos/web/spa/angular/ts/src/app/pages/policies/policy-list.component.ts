import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import type { QueryPoliciesResultUnifiedFilterInput } from '@insurup/sdk';
import { ClientService } from '../../services/client.service';
import { DataTableComponent, type Column } from '../../components/data-table.component';
import { PaginationComponent } from '../../components/pagination.component';

interface Policy {
  id: string;
  policyNumber: string | null;
  productBranch: string | null;
  insuranceCompanyName: string | null;
  customerName: string | null;
  grossPremium: number | null;
  startDate: string | null;
  endDate: string | null;
  state: string | null;
}

const sortFieldToApiField: Record<string, string> = {
  policyNumber: 'insuranceCompanyPolicyNumber',
};

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule,
    DataTableComponent,
    PaginationComponent,
  ],
  template: `
    <div class="policy-list">
      <div class="header">
        <div>
          <h1>Policies</h1>
          <p class="subtitle">Browse and manage insurance policies.</p>
        </div>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search policies</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="search" (ngModelChange)="onSearch($event)" />
      </mat-form-field>

      <app-data-table
        [columns]="columns"
        [data]="policies()"
        [isLoading]="isLoading()"
        [sortField]="sortField()"
        [sortDirection]="sortDirection()"
        (sort)="onSort($event)"
        (rowClick)="onRowClick($event)"
      >
        <ng-template #cellTemplate let-item let-column="column">
          @if (column.key === 'productBranch') {
            <mat-chip>{{ item.productBranch || '-' }}</mat-chip>
          } @else if (column.key === 'state') {
            <mat-chip [color]="getStateColor(item.state)">{{ item.state || '-' }}</mat-chip>
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
      .policy-list h1 {
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
export class PolicyListComponent {
  private router = inject(Router);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  policies = signal<Policy[]>([]);
  isLoading = signal(true);
  totalCount = signal<number | null>(null);
  pageInfo = signal({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null as string | null,
    endCursor: null as string | null,
  });

  search = '';
  sortField = signal('startDate');
  sortDirection = signal<'asc' | 'desc'>('desc');
  cursor = signal<string | null>(null);
  direction = signal('forward');
  currentPage = signal(1);

  columns: Column<Policy>[] = [
    {
      key: 'policyNumber',
      header: 'Policy Number',
      sortable: true,
      render: (p) => p.policyNumber || '-',
    },
    { key: 'productBranch', header: 'Branch' },
    {
      key: 'insuranceCompanyName',
      header: 'Insurance Company',
      render: (p) => p.insuranceCompanyName || '-',
    },
    { key: 'customerName', header: 'Customer', render: (p) => p.customerName || '-' },
    {
      key: 'grossPremium',
      header: 'Premium',
      sortable: true,
      render: (p) => this.formatCurrency(p.grossPremium),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      render: (p) => this.formatDate(p.startDate),
    },
    { key: 'endDate', header: 'End Date', render: (p) => this.formatDate(p.endDate) },
    { key: 'state', header: 'Status' },
  ];

  constructor() {
    effect(() => {
      this.fetchPolicies();
    });
  }

  async fetchPolicies(): Promise<void> {
    this.isLoading.set(true);
    try {
      const filterOptions: QueryPoliciesResultUnifiedFilterInput | undefined = this.search
        ? { insuranceCompanyPolicyNumber: { $search: true, textSearch: { value: this.search } } }
        : undefined;

      const apiSortField = sortFieldToApiField[this.sortField()] || this.sortField();

      const countPromise = this.clientService.policies.getPolicies({
        first: 1,
        filter: filterOptions,
        select: ['id'] as const,
        includeTotalCount: true,
      });

      const result = await this.clientService.policies.getPolicies({
        select: [
          'id',
          'insuranceCompanyPolicyNumber',
          'productBranch',
          'insuranceCompanyName',
          'insuredCustomerName',
          'grossPremium',
          'startDate',
          'endDate',
          'state',
        ] as const,
        first: this.direction() === 'forward' ? 10 : undefined,
        last: this.direction() === 'backward' ? 10 : undefined,
        after: this.direction() === 'forward' ? this.cursor() : undefined,
        before: this.direction() === 'backward' ? this.cursor() : undefined,
        filter: filterOptions,
        order: apiSortField
          ? [{ [apiSortField]: this.sortDirection() === 'asc' ? 'ASC' : 'DESC' }]
          : undefined,
        includeTotalCount: false,
      });

      if (result.isSuccess) {
        const nodes =
          result.data.nodes?.filter((n): n is NonNullable<typeof n> => n !== null) ?? [];
        this.policies.set(
          nodes.map((n) => ({
            id: n.id,
            policyNumber: n.insuranceCompanyPolicyNumber ?? null,
            productBranch: n.productBranch ? String(n.productBranch) : null,
            insuranceCompanyName: n.insuranceCompanyName ?? null,
            customerName: n.insuredCustomerName ?? null,
            grossPremium: n.grossPremium ?? null,
            startDate: n.startDate ? String(n.startDate) : null,
            endDate: n.endDate ? String(n.endDate) : null,
            state: n.state ? String(n.state) : null,
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
        this.snackBar.open('Failed to load policies', 'Close', { duration: 3000 });
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
    this.fetchPolicies();
  }

  onSort(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
    this.cursor.set(null);
    this.direction.set('forward');
    this.currentPage.set(1);
    this.fetchPolicies();
  }

  onNextPage(): void {
    const pi = this.pageInfo();
    if (pi.endCursor) {
      this.cursor.set(pi.endCursor);
      this.direction.set('forward');
      this.currentPage.update((p) => p + 1);
      this.fetchPolicies();
    }
  }

  onPreviousPage(): void {
    const pi = this.pageInfo();
    if (pi.startCursor) {
      this.cursor.set(pi.startCursor);
      this.direction.set('backward');
      this.currentPage.update((p) => Math.max(1, p - 1));
      this.fetchPolicies();
    }
  }

  onRowClick(policy: Policy): void {
    this.router.navigate(['/policies', policy.id]);
  }

  formatCurrency(value: number | null): string {
    if (value === null) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  }

  formatDate(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
  }

  getStateColor(state: string | null): 'primary' | 'accent' | 'warn' | undefined {
    switch (state) {
      case 'Active':
      case 'ACTIVE':
        return 'primary';
      case 'Cancelled':
      case 'CANCELLED':
        return 'warn';
      default:
        return undefined;
    }
  }
}
