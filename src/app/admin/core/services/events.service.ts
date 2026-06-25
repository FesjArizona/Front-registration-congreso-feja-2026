import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../core/models/api-response.interface';
import { RegisteredUsers } from '../../core/models/events.service';
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

}
