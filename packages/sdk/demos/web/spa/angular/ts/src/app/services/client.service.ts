import { Injectable, inject } from '@angular/core';
import { DefaultInsurUpClient } from '@insurup/sdk';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private authService = inject(AuthService);
  private client: DefaultInsurUpClient;

  constructor() {
    this.client = new DefaultInsurUpClient({
      auth: this.authService.auth,
      baseUrl: environment.apiBaseUrl,
    });
  }

  get sdk(): DefaultInsurUpClient {
    return this.client;
  }

  get customers() {
    return this.client.customers;
  }

  get policies() {
    return this.client.policies;
  }
}
