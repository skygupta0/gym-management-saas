import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.models';
import { Membership, MembershipPlan, MembershipPlanCreateRequest, MembershipPurchaseRequest } from '../models/gym.models';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly plansUrl = '/api/v1/plans';
  private readonly membershipsUrl = '/api/v1/memberships';

  getPlans(activeOnly = true): Observable<ApiResponse<MembershipPlan[]>> {
    return this.http.get<ApiResponse<MembershipPlan[]>>(this.plansUrl, {
      params: new HttpParams().set('activeOnly', activeOnly.toString())
    });
  }

  createPlan(request: MembershipPlanCreateRequest): Observable<ApiResponse<MembershipPlan>> {
    return this.http.post<ApiResponse<MembershipPlan>>(this.plansUrl, request);
  }

  purchaseMembership(request: MembershipPurchaseRequest): Observable<ApiResponse<Membership>> {
    return this.http.post<ApiResponse<Membership>>(`${this.membershipsUrl}/purchase`, request);
  }

  getMemberMemberships(memberId: string): Observable<ApiResponse<Membership[]>> {
    return this.http.get<ApiResponse<Membership[]>>(`${this.membershipsUrl}/member/${memberId}`);
  }
}
