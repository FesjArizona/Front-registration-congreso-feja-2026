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
export class OverviewCongresoComponent implements OnInit {

  baseUrlIcon: string = '../../../../../assets/icons/admin/';

  private dashboardService = inject(DashboardService);
  private eventsService = inject(EventsService);

  // ---------- estado de carga ----------
  cargandoStats = true;
  cargandoActivities = true;
  cargandoStaff = true;
  skeletonCards = Array.from({ length: 4 });

  // Variables fuertemente tipadas gracias al modelo
  public statsList: StatCard[] = [];
  public activitiesList: RecentActivity[] = [];
  public staffList: StaffMember[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Ejemplo consumiendo los endpoints por separado:
    this.cargandoStats = true;
    this.eventsService.getResumen(2).subscribe({
      next: (result) => {
        this.statsList = result.data
      },
      error: (err) => {
        console.error('Error al cargar stats', err)
        this.cargandoStats = false;
      },
      complete: () => {
        this.cargandoStats = false;
      }
    });

    this.cargandoActivities = true;
    this.dashboardService.getRecentActivities().subscribe({
      next: (data) => this.activitiesList = data,
      error: (err) => {
        console.error('Error al cargar actividades', err)
        this.cargandoActivities = false;
      },
      complete: () => {
        this.cargandoActivities = false;
      }
    });

    this.cargandoStaff = true;
    this.dashboardService.getStaffMembers().subscribe({
      next: (data) => this.staffList = data,
      error: (err) => {
        console.error('Error al cargar staff', err)
        this.cargandoStaff = false;
      },
      complete: () => {
        this.cargandoStaff = false;
      }
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
