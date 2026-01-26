import { Component, Input, Output, EventEmitter, ContentChild } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import type { Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    @if (isLoading) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (data.length === 0) {
      <div class="empty-container">
        <mat-icon class="empty-icon">inbox</mat-icon>
        <p class="empty-title">No results found</p>
        <p class="empty-subtitle">Try adjusting your search or filters</p>
      </div>
    } @else {
      <table mat-table [dataSource]="data" matSort (matSortChange)="onSort($event)" class="data-table">
        @for (column of columns; track column.key) {
          <ng-container [matColumnDef]="column.key">
            <th mat-header-cell *matHeaderCellDef [mat-sort-header]="column.sortable ? column.key : ''">
              {{ column.header }}
            </th>
            <td mat-cell *matCellDef="let item">
              @if (cellTemplate) {
                <ng-container *ngTemplateOutlet="cellTemplate; context: { $implicit: item, column: column }"></ng-container>
              } @else {
                {{ getCellValue(item, column) }}
              }
            </td>
          </ng-container>
        }
        
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
            (click)="rowClick.emit(row)" 
            class="clickable-row"></tr>
      </table>
    }
  `,
  styles: [`
    .loading-container, .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
    }
    .empty-title {
      margin: 16px 0 8px;
      font-weight: 500;
    }
    .empty-subtitle {
      opacity: 0.7;
      font-size: 14px;
    }
    .data-table {
      width: 100%;
    }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  `],
})
export class DataTableComponent<T> {
  @Input() columns: Column<T>[] = [];
  @Input() data: T[] = [];
  @Input() isLoading = false;
  @Input() sortField: string | null = null;
  @Input() sortDirection: 'asc' | 'desc' | null = null;
  
  @Output() sort = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();
  @Output() rowClick = new EventEmitter<T>();
  
  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<{ $implicit: T; column: Column<T> }>;

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  getCellValue(item: T, column: Column<T>): string {
    if (column.render) {
      return column.render(item);
    }
    return String((item as Record<string, unknown>)[column.key] ?? '');
  }

  onSort(event: Sort): void {
    if (event.direction) {
      this.sort.emit({ field: event.active, direction: event.direction });
    }
  }
}
