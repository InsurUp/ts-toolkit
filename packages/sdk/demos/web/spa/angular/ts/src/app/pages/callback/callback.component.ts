import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner diameter="40"></mat-spinner>
      <p>Completing login...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      gap: 16px;
    }
  `],
})
export class CallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    const success = await this.authService.handleCallback();
    if (success) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
