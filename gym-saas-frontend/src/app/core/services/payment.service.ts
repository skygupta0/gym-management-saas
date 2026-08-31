import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResponse } from '../models/auth.models';
import { Payment, PaymentCollectRequest } from '../models/gym.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/payments';

  collectPayment(request: PaymentCollectRequest): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.apiUrl}/collect`, request);
  }

  getPayments(page = 0, size = 20): Observable<ApiResponse<PagedResponse<Payment>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PagedResponse<Payment>>>(this.apiUrl, { params });
  }

  getMemberPayments(memberId: string): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/member/${memberId}`);
  }
}
