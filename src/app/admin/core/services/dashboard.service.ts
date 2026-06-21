import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
// Importamos tus interfaces
import { DashboardData, StatCard, RecentActivity, StaffMember } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  // La ruta hacia tu archivo local en assets
  private jsonUrl = 'assets/data/dashboard.json';

  // Opción A: Traer todo el objeto JSON junto
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.jsonUrl);
  }

  // Opción B: Traer solo las estadísticas filtrando el JSON
  getStats(): Observable<StatCard[]> {
    return this.http.get<DashboardData>(this.jsonUrl).pipe(
      map(response => response.stats)
    );
  }

  // Opción C: Traer solo las actividades recientes filtrando el JSON
  getRecentActivities(): Observable<RecentActivity[]> {
    return this.http.get<DashboardData>(this.jsonUrl).pipe(
      map(response => response.activities)
    );
  }

  // Opción D: Traer solo el staff filtrando el JSON
  getStaffMembers(): Observable<StaffMember[]> {
    return this.http.get<DashboardData>(this.jsonUrl).pipe(
      map(response => response.staff)
    );
  }
}
