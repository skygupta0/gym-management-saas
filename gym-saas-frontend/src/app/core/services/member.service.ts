import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResponse } from '../models/auth.models';
import { Member, MemberCreateRequest, MemberStatus, MemberUpdateRequest } from '../models/gym.models';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/members';

  getMembers(page = 0, size = 20, status?: MemberStatus): Observable<ApiResponse<PagedResponse<Member>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PagedResponse<Member>>>(this.apiUrl, { params });
  }

  searchMembers(query: string): Observable<ApiResponse<Member[]>> {
    return this.http.get<ApiResponse<Member[]>>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('q', query)
    });
  }

  getMember(id: string): Observable<ApiResponse<Member>> {
    return this.http.get<ApiResponse<Member>>(`${this.apiUrl}/${id}`);
  }

  getMemberByCode(memberCode: string): Observable<ApiResponse<Member>> {
    return this.http.get<ApiResponse<Member>>(`${this.apiUrl}/code/${memberCode}`);
  }

  createMember(request: MemberCreateRequest): Observable<ApiResponse<Member>> {
    return this.http.post<ApiResponse<Member>>(this.apiUrl, request);
  }

  updateMember(id: string, request: MemberUpdateRequest): Observable<ApiResponse<Member>> {
    return this.http.put<ApiResponse<Member>>(`${this.apiUrl}/${id}`, request);
  }

  deleteMember(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
