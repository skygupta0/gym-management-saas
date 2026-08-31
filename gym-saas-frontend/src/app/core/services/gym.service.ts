import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Tenant } from '../models/auth.models';

export interface TenantUpdateRequest {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  logoUrl?: string;
  currency?: string;
  timezone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GymService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/gyms';

  getGymProfile(): Observable<ApiResponse<Tenant>> {
    return this.http.get<ApiResponse<Tenant>>(`${this.apiUrl}/me`);
  }

  updateGymProfile(request: TenantUpdateRequest): Observable<ApiResponse<Tenant>> {
    return this.http.put<ApiResponse<Tenant>>(`${this.apiUrl}/me`, request);
  }
}
