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
export class OverviewCongresoComponent
  implements OnInit, AfterViewInit, OnDestroy {
  public chartOptionsTshirts: Partial<ChartOptions> = {
    series: [44, 55, 67, 83],
    chart: {
      height: 200,
      type: 'radialBar',
    },
    fill: {
      colors: ['#CD7F32', '#FFAC1C', '#CC5500', '#E49B0F']
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '20px',
          },
          value: {
            offsetY: 10,
            fontSize: '16px',
          },
          total: {
            show: true,
            label: 'Tallas',
            formatter: (w: any) => {
              const totals = w.globals?.seriesTotals ?? [];
              if (!totals.length) {
                return '0';
              }
              const sum = totals.reduce(
                (acc: number, value: number) => acc + value,
                0,
              );
              return Math.round(sum / totals.length).toString();
            },
          },
        },
      },
    },
    labels: ['Small', 'Medium', 'Large', 'Extra Large'],
  };

  public chartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: 'Hombres',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
      },
      {
        name: 'Mujeres',
        data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
      },
    ],
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
      ],
    },
    yaxis: {
      title: {
        text: '(Cantidad)',
      },
    },
    fill: {
      opacity: 1,
      colors: ['#B87333', '#F4BB44'],
    },
    tooltip: {
      y: {
        formatter: (val) => {
          return val + ' en' + ' total';
        },
      },
    },
  };

  @ViewChild('chart') chart!: ChartComponent;
  private randomizeArray: any = function (arg: any[]) {
    var array = arg.slice();
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  // Datos de ejemplo: una por cada semana
  private sparklineData: any = [
    16, 30, 50, 80, 20, 40, 18, 60, 30, 50, 90, 60, 20, 70, 60,
  ];

  // Genera etiquetas dinámicas tipo "Sem 1", "Sem 2"... según el largo de sparklineData
  private getWeekLabels(count: number): string[] {
    return Array.from({ length: count }, (_, i) => `Semana ${i + 1}`);
  }

  public chartOptions3: Partial<ChartOptions> = {
    series: [
      {
        name: 'Inscripciones',
        data: this.randomizeArray(this.sparklineData),
      },
    ],
    chart: {
      type: 'area',
      height: 190,
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      crosshairs: {
        width: 1,
      },
      categories: this.getWeekLabels(this.sparklineData.length),
    },
    fill: {
      opacity: 0.3,
      colors: ['#FFA500', '#E49B0F', '#DAA520'],
    },
    yaxis: {
      min: 0,
    },
    title: {
      text: `${this.sparklineData.reduce((a: number, b: number) => a + b, 0)}`,
      offsetX: 0,
      style: {
        fontSize: '24px',
      },
    },
    subtitle: {
      text: 'Inscripciones',
      offsetX: 0,
      style: {
        fontSize: '14px',
      },
    },
  };

  ngAfterViewInit() {
    (window as any).Apex = {
      stroke: {
        width: 3,
      },
      markers: {
        size: 0,
      },
      tooltip: {
        fixed: {
          enabled: true,
        },
      },
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

  // Variables fuertemente tipadas gracias al modelo
  public statsList: StatCard[] = [];
  public activitiesList: RecentActivity[] = [];
  public staffList: StaffMember[] = [];
  actividadReciente: any[] = [];
  private eventSource!: EventSource;

  ngOnInit(): void {
    this.loadDashboardData();
    this.conectarSSE();

  }

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
    // Ejemplo consumiendo los endpoints por separado:
    this.cargandoStats = true;
    this.eventsService.getResumen(2).subscribe({
      next: (result) => {
        this.statsList = result.data;
      },
      error: (err) => {
        console.error('Error al cargar stats', err);
        this.cargandoStats = false;
      },
      complete: () => {
        this.cargandoStats = false;
      },
    });

    this.cargandoActivities = true;
    this.eventsService.getRecentActivities(2).subscribe({
      next: (resoponse) => (this.activitiesList = resoponse.data),
      error: (err) => {
        console.error('Error al cargar actividades', err);
        this.cargandoActivities = false;
      },
      complete: () => {
        this.cargandoActivities = false;
      },
    });

    this.cargandoStaff = true;
    this.dashboardService.getStaffMembers().subscribe({
      next: (data) => (this.staffList = data),
      error: (err) => {
        console.error('Error al cargar staff', err);
        this.cargandoStaff = false;
      },
      complete: () => {
        this.cargandoStaff = false;
      },
    });
  }
  public isoADdmmyyyy(fecha: string | null): string {
    if (!fecha) return '';

    const dateObj = new Date(fecha);

    if (isNaN(dateObj.getTime())) return fecha;

    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();

    let resultado = `${d}/${m}/${y}`;

    /* if (fecha.includes('T')) {
      let horas = dateObj.getHours();
      const minutos = String(dateObj.getMinutes()).padStart(2, '0');
      const ampm = horas >= 12 ? 'PM' : 'AM';

      horas = horas % 12;
      horas = horas ? horas : 12;

      const horasStr = String(horas).padStart(2, '0');

      resultado += ` ${horasStr}:${minutos} ${ampm}`;
    } */

    return resultado;
  }

}
