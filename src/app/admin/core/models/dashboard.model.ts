
export interface StatCard {
  icon: string;
  label: string;
  value: number;
}

export interface RecentActivity {
  nombre: string;
  apellidos: string;
  conferencia: string;
  correo: string;
  created_at: string;
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
