import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.models';
import { Attendance, CheckInRequest, OccupancyResponse } from '../models/gym.models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/attendance';

  checkIn(request: CheckInRequest): Observable<ApiResponse<Attendance>> {
    return this.http.post<ApiResponse<Attendance>>(`${this.apiUrl}/check-in`, request);
  }

  checkOut(memberId: string): Observable<ApiResponse<Attendance>> {
    return this.http.post<ApiResponse<Attendance>>(`${this.apiUrl}/check-out`, null, {
      params: new HttpParams().set('memberId', memberId)
    });
  }

  getTodayAttendance(): Observable<ApiResponse<Attendance[]>> {
    return this.http.get<ApiResponse<Attendance[]>>(`${this.apiUrl}/today`);
  }

  getLiveOccupancy(): Observable<ApiResponse<OccupancyResponse>> {
    return this.http.get<ApiResponse<OccupancyResponse>>(`${this.apiUrl}/occupancy`);
  }
}
