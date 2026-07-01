import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../core/models/api-response.interface';
import { RegisteredUsers } from '../models/events.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { URL_API } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private httpClient: HttpClient) { }

  public getRegisteredUsers(eventId: number): Observable<ApiResponse<RegisteredUsers[]>> {
    return this.httpClient.get<ApiResponse<RegisteredUsers[]>>(`${URL_API}/events/${eventId || 2}/registrations`)
  }

  public checkInUser(userId: number): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(`${URL_API}/events/register/${userId}/checkin`)
  }

  public removeRegister(registerId: number): Observable<ApiResponse<any>> {
    return this.httpClient.delete<ApiResponse<any>>(`${URL_API}/events/register/${registerId}/delete`)
  }

  public updateRegister(data: any, registerId: number): Observable<ApiResponse<any>> {
    return this.httpClient.put<ApiResponse<any>>(`${URL_API}/events/register/${registerId}/update`, data)
  }



}
