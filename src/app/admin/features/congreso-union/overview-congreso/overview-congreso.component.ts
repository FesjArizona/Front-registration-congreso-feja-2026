import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StatCard, RecentActivity, StaffMember } from '../../../core/models/dashboard.model';
import { EventsService } from '../../../core/services/events.service';

@Component({
  standalone: true,
  selector: 'app-overview-congreso',
  imports: [CommonModule],
  templateUrl: './overview-congreso.component.html',
  styleUrls: ['./overview-congreso.component.scss']
})
export class OverviewCongresoComponent {

  baseUrlIcon: string = '../../../../../assets/icons/admin/';

  private dashboardService = inject(DashboardService);
  private eventsService = inject(EventsService);

  // Variables fuertemente tipadas gracias al modelo
  public statsList: StatCard[] = [];
  public activitiesList: RecentActivity[] = [];
  public staffList: StaffMember[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Ejemplo consumiendo los endpoints por separado:
    this.eventsService.getResumen(2).subscribe({
      next: (result) => {
        this.statsList = result.data
      },
      error: (err) => console.error('Error al cargar stats', err)
    });

    this.dashboardService.getRecentActivities().subscribe({
      next: (data) => this.activitiesList = data,
      error: (err) => console.error('Error al cargar actividades', err)
    });

    this.dashboardService.getStaffMembers().subscribe({
      next: (data) => this.staffList = data,
      error: (err) => console.error('Error al cargar staff', err)
    });
  }

  getBadgeClass(status: RecentActivity['checkIn']): string {
    switch (status) {
      case 'Completado': return 'badge-completed';
      case 'In Progress': return 'badge-progress';
      case 'Registered': return 'badge-registered';
      default: return '';
    }
  }

}
