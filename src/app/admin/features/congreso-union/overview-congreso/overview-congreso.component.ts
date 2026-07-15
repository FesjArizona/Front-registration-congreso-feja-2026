import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StatCard, RecentActivity, StaffMember } from '../../../core/models/dashboard.model';
import { EventsService } from '../../../core/services/events.service';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexTooltip,
  ApexMarkers,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexAnnotations,
  ApexStates,
  ApexTheme,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { URL_API } from '../../../../environment/environment';

export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  annotations?: ApexAnnotations;
  states?: ApexStates;
  theme?: ApexTheme;
  colors?: string[];
  labels?: any;
};

@Component({
  standalone: true,
  selector: 'app-overview-congreso',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './overview-congreso.component.html',
  styleUrls: ['./overview-congreso.component.scss'],
})
export class OverviewCongresoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chart') chart!: ChartComponent;

  // ---------- ESTADOS INICIALES (VACÍOS) DE LAS GRÁFICAS ----------

  // 1. Gráfica de Tallas de Camisas (RadialBar)
  public chartOptionsTshirts: Partial<ChartOptions> = {
    series: [], // Se llena dinámicamente
    labels: [], // Se llena dinámicamente
    chart: { height: 200, type: 'radialBar' },
    fill: { colors: ['#CD7F32', '#FFAC1C', '#CC5500', '#E49B0F'] },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '50%',
        },
        dataLabels: {
          name: { fontSize: '20px' },
          value: { offsetY: 10, fontSize: '16px' },
          total: {
            show: true,
            label: 'Camisas',
            formatter: (w: any) => {
              const totals = w.globals?.seriesTotals ?? [];
              if (!totals.length) return '0';
              const sum = totals.reduce((acc: number, value: number) => acc + value, 0);
              return Math.round(sum / totals.length).toString();
            },
          },
        },
      },
    },
  };

  // 2. Gráfica de Género por Mes (Barras)
  public chartOptions: Partial<ChartOptions> = {
    series: [], // Se llena dinámicamente
    xaxis: { categories: [] }, // Se llena dinámicamente
    chart: { type: 'bar', height: 350 },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    yaxis: { title: { text: '(Cantidad)' } },
    fill: { opacity: 1, colors: ['#B87333', '#F4BB44'] },
    tooltip: {
      y: {
        formatter: (val) => val + ' en total',
      },
    },
  };

  // 3. Gráfica de Inscripciones por Semana (Sparkline)
  public chartOptions3: Partial<ChartOptions> = {
    series: [], // Se llena dinámicamente
    xaxis: { crosshairs: { width: 1 }, categories: [] }, // Se llena dinámicamente
    title: {
      text: '0', // Se actualiza dinámicamente
      offsetX: 0,
      style: { fontSize: '24px' },
    },
    chart: { type: 'area', height: 190, sparkline: { enabled: true } },
    stroke: { curve: 'smooth' },
    fill: { opacity: 0.3, colors: ['#FFA500', '#E49B0F', '#DAA520'] },
    yaxis: { min: 0 },
    subtitle: { text: 'Inscripciones', offsetX: 0, style: { fontSize: '14px' } },
  };


  ngAfterViewInit() {
    (window as any).Apex = {
      stroke: { width: 3 },
      markers: { size: 0 },
      tooltip: { fixed: { enabled: true } },
    };
  }

  baseUrlIcon: string = '../../../../../assets/icons/admin/';

  private dashboardService = inject(DashboardService);
  private eventsService = inject(EventsService);
  private cdr = inject(ChangeDetectorRef);

  // ---------- estado de carga ----------
  cargandoStats = true;
  cargandoActivities = true;
  cargandoStaff = true;
  skeletonCards = Array.from({ length: 4 });
  skeletonTable = Array.from({ length: 6 });

  public statsList: StatCard[] = [];
  public activitiesList: RecentActivity[] = [];
  public staffList: StaffMember[] = [];
  actividadReciente: any[] = [];
  private eventSource!: EventSource;

  ngOnInit(): void {
    this.loadDashboardData();
    this.conectarSSE();

    // Suponiendo que el ID del evento es dinámico más adelante, por ahora pasamos 2
    const eventId = 2;
    this.getWeeklyRegistrations(eventId);
    this.getGenderByMonth(eventId);
    this.getTshirtSizes(eventId);
  }

  // ---------- LLAMADAS A LA API DE GRÁFICAS ----------

  getWeeklyRegistrations(eventId: number) {
    this.dashboardService.getWeeklyRegistrations(eventId).subscribe({
      next: (result) => {
        const data = result.data;
        // Reasignamos el objeto completo para que ApexCharts detecte el cambio
        this.chartOptions3 = {
          ...this.chartOptions3,
          series: [{ name: 'Inscripciones', data: data.seriesData }],
          xaxis: { ...this.chartOptions3.xaxis, categories: data.categories },
          title: { ...this.chartOptions3.title, text: `${data.total}` }
        };
      },
      error: (err) => console.error('Error al cargar stats semanales', err)
    });
  }

  getGenderByMonth(eventId: number) {
    this.dashboardService.getGenderByMonth(eventId).subscribe({
      next: (result) => {
        const data = result.data;
        this.chartOptions = {
          ...this.chartOptions,
          series: data.series,
          xaxis: { ...this.chartOptions.xaxis, categories: data.categories }
        };
      },
      error: (err) => console.error('Error al cargar stats por género', err)
    });
  }

  getTshirtSizes(eventId: number) {
    this.dashboardService.getTshirtSizes(eventId).subscribe({
      next: (result) => {
        const data = result.data;
        this.chartOptionsTshirts = {
          ...this.chartOptionsTshirts,
          series: data.series,
          labels: data.labels
        };
        this.forceChartResize();
      },
      error: (err) => console.error('Error al cargar stats de camisas', err)
    });
  }

  // ---------- RESTO DE TU LÓGICA (SSE, DASHBOARD, FECHAS) ----------

  conectarSSE() {
    this.eventSource = new EventSource(`${URL_API}/events/stream`);

    this.eventSource.onmessage = (event) => {
      const nuevoRegistro = JSON.parse(event.data);
      this.activitiesList.unshift(nuevoRegistro);
      if (this.activitiesList.length > 5) {
        this.activitiesList.pop();
      }
      this.cdr.detectChanges();
    };

    this.eventSource.onerror = (error) => {
      console.error('Error en SSE:', error);
    };
  }

  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  private loadDashboardData(): void {
    this.cargandoStats = true;
    this.eventsService.getResumen(2).subscribe({
      next: (result) => { this.statsList = result.data; },
      error: (err) => {
        console.error('Error al cargar stats', err);
        this.cargandoStats = false;
      },
      complete: () => { this.cargandoStats = false; this.forceChartResize() },
    });

    this.cargandoActivities = true;
    this.eventsService.getRecentActivities(2).subscribe({
      next: (response) => (this.activitiesList = response.data),
      error: (err) => {
        console.error('Error al cargar actividades', err);
        this.cargandoActivities = false;
      },
      complete: () => { this.cargandoActivities = false; this.forceChartResize() },
    });

    this.cargandoStaff = true;
    this.dashboardService.getStaffMembers().subscribe({
      next: (data) => (this.staffList = data),
      error: (err) => {
        console.error('Error al cargar staff', err);
        this.cargandoStaff = false;
      },
      complete: () => { this.cargandoStaff = false; this.forceChartResize() },
    });
  }

  public isoADdmmyyyy(fecha: string | null): string {
    if (!fecha) return '';
    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return fecha;

    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();

    return `${d}/${m}/${y}`;
  }

  public calcularTiempoTranscurrido(fecha: string | null): string {
    if (!fecha) return '';

    const registro = new Date(fecha);
    const hoy = new Date();

    // Normalizamos ambas fechas a las 00:00:00 para comparar solo el calendario
    registro.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);

    const diffTime = hoy.getTime() - registro.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays > 1) return `Hace ${diffDays} días`;

    return this.isoADdmmyyyy(fecha);
  }

  private forceChartResize() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500); // Esperamos 500ms para que el DOM esté listo
  }

}
