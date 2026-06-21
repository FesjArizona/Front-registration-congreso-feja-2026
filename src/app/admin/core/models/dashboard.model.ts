
export interface StatCard {
  icon: string;
  label: string;
  value: number;
}

export interface RecentActivity {
  usuario: string;
  contacto: string;
  fecha: string;
  checkIn: 'Completado' | 'In Progress' | 'Registered';
}

export interface StaffMember {
  nombre: string;
  cargo: string;
  estado: 'Completado' | 'Pending';
  initials: string;
}


export interface DashboardData {
  stats: StatCard[];
  activities: RecentActivity[];
  staff: StaffMember[];
}
