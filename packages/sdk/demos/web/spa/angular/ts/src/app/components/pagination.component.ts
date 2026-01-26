import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pagination">
      <div class="pagination-info">
        @if (totalCount !== null) {
          Showing {{ start }}-{{ end }} of {{ totalCount | number }} items
          @if (totalPages) {
            (Page {{ currentPage }} of {{ totalPages }})
          }
        } @else {
          Page {{ currentPage }}
        }
      </div>
      <div class="pagination-buttons">
        <button mat-stroked-button 
                [disabled]="!hasPreviousPage || isLoading" 
                (click)="previous.emit()">
          <mat-icon>chevron_left</mat-icon>
          Previous
        </button>
        <button mat-stroked-button 
                [disabled]="!hasNextPage || isLoading" 
                (click)="next.emit()">
          Next
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }
    .pagination-info {
      font-size: 14px;
      opacity: 0.7;
    }
    .pagination-buttons {
      display: flex;
      gap: 8px;
    }
  `],
})
export class PaginationComponent {
  @Input() hasNextPage = false;
  @Input() hasPreviousPage = false;
  @Input() isLoading = false;
  @Input() totalCount: number | null = null;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  get start(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get end(): number {
    if (this.totalCount !== null) {
      return Math.min(this.currentPage * this.pageSize, this.totalCount);
    }
    return this.currentPage * this.pageSize;
  }

  get totalPages(): number | null {
    if (this.totalCount === null) return null;
    return Math.ceil(this.totalCount / this.pageSize);
  }
}
