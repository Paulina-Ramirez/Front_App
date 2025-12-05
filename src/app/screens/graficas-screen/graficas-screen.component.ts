import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  // Datos dinámicos
  public total_users: any = {
    admins: 0,
    maestros: 0,
    alumnos: 0
  };

  public materias_por_programa: any[] = [];
  public distribucion_dias: any = {
    Lunes: 0,
    Martes: 0,
    Miércoles: 0,
    Jueves: 0,
    Viernes: 0
  };

  // Flags de carga
  public cargandoUsuarios: boolean = true;
  public cargandoMaterias: boolean = true;

  // Configuración común para gráficas
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      datalabels: {
        formatter: (value: any, ctx: any) => {
          if (ctx.chart.data.labels) {
            return ctx.chart.data.labels[ctx.dataIndex];
          }
          return '';
        },
      },
    }
  };

  // ============ GRÁFICA 1: LÍNEA - MATERIAS POR DÍA ============
  public lineChartData: ChartData<'line', number[], string> = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        label: 'Materias por día',
        fill: true,
        tension: 0.3,
        borderColor: '#0092B8',
        backgroundColor: 'rgba(0, 146, 184, 0.1)',
        pointBackgroundColor: '#0092B8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0092B8'
      }
    ]
  };
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [DatalabelsPlugin];
  public lineChartOptions: ChartConfiguration['options'] = this.chartOptions;

  // ============ GRÁFICA 2: BARRAS - MATERIAS POR PROGRAMA ============
  public barChartData: ChartData<'bar', number[], string> = {
    labels: ['Cargando...'],
    datasets: [
      {
        data: [0],
        label: 'Materias por programa',
        backgroundColor: [
          '#0092B8',
          '#17a2b8',
          '#28a745',
          '#dc3545',
          '#ffc107'
        ],
        borderColor: [
          '#007bff',
          '#17a2b8',
          '#28a745',
          '#dc3545',
          '#ffc107'
        ],
        borderWidth: 1
      }
    ]
  };
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [DatalabelsPlugin];
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      datalabels: {
        formatter: (value: any, ctx: any) => {
          return value;
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // ============ GRÁFICA 3: PASTEL - USUARIOS POR ROL ============
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: ['Administradores', 'Maestros', 'Alumnos'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56'
        ]
      }
    ]
  };
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [DatalabelsPlugin];
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      datalabels: {
        formatter: (value: any, ctx: any) => {
          let sum = 0;
          const dataArr = ctx.chart.data.datasets[0].data;
          dataArr.forEach((data: any) => {
            sum += data;
          });
          if (sum === 0) return '0%';
          const percentage = ((value * 100) / sum).toFixed(1) + "%";
          return percentage;
        },
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14
        }
      }
    }
  };

  // ============ GRÁFICA 4: DONA - USUARIOS POR ROL ============
  public doughnutChartData: ChartData<'doughnut', number[], string> = {
    labels: ['Administradores', 'Maestros', 'Alumnos'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          '#4BC0C0',
          '#FF9F40',
          '#9966FF'
        ],
        hoverBackgroundColor: [
          '#4BC0C0',
          '#FF9F40',
          '#9966FF'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartPlugins = [DatalabelsPlugin];
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      datalabels: {
        formatter: (value: any, ctx: any) => {
          let sum = 0;
          const dataArr = ctx.chart.data.datasets[0].data;
          dataArr.forEach((data: any) => {
            sum += data;
          });
          if (sum === 0) return '0%';
          const percentage = ((value * 100) / sum).toFixed(0) + "%";
          return percentage;
        },
        color: '#333',
        font: {
          weight: 'bold',
          size: 16
        }
      }
    }
  };

  constructor(
    private administradoresService: AdministradoresService,
    private materiasService: MateriasService
  ) { }

  ngOnInit(): void {
    this.obtenerDatosGraficas();
  }

  // Función principal para obtener todos los datos
  public obtenerDatosGraficas() {
    this.cargandoUsuarios = true;
    this.cargandoMaterias = true;

    // 1. Obtener datos de usuarios
    this.obtenerTotalUsuarios();

    // 2. Obtener datos de materias
    this.obtenerDatosMaterias();
  }

  // Obtener total de usuarios
  public obtenerTotalUsuarios() {
    this.administradoresService.getTotalUsuarios().subscribe(
      (response: any) => {
        this.total_users = response;
        console.log("Total usuarios obtenido: ", this.total_users);

        // Actualizar gráficas de usuarios
        this.actualizarGraficasUsuarios();

        this.cargandoUsuarios = false;
      },
      (error: any) => {
        console.error("Error al obtener total de usuarios: ", error);
        // Datos de ejemplo en caso de error
        this.total_users = { admins: 5, maestros: 12, alumnos: 150 };
        this.actualizarGraficasUsuarios();
        this.cargandoUsuarios = false;
      }
    );
  }

  // Obtener datos de materias
  public obtenerDatosMaterias() {
    // Obtener distribución por días
    this.obtenerDistribucionMateriasPorDias();

    // Obtener materias por programa educativo
    this.obtenerMateriasPorPrograma();
  }

  // Obtener distribución de materias por días
  public obtenerDistribucionMateriasPorDias() {
    // Primero intentamos obtener todas las materias y calcular manualmente
    this.materiasService.obtenerListaMaterias().subscribe(
      (response: any) => {
        this.calcularDistribucionDias(response);
        this.cargandoMaterias = false;
      },
      (error: any) => {
        console.error("Error al obtener materias: ", error);
        // Datos de ejemplo
        this.distribucion_dias = { Lunes: 8, Martes: 10, Miércoles: 7, Jueves: 9, Viernes: 6 };
        this.actualizarGraficaLinea();
        this.cargandoMaterias = false;
      }
    );
  }

  // Calcular distribución de días manualmente
  private calcularDistribucionDias(materias: any[]) {
    const distribucion = { Lunes: 0, Martes: 0, Miércoles: 0, Jueves: 0, Viernes: 0 };

    materias.forEach((materia: any) => {
      if (materia.dias && Array.isArray(materia.dias)) {
        materia.dias.forEach((dia: string) => {
          if (distribucion.hasOwnProperty(dia)) {
            distribucion[dia as keyof typeof distribucion]++;
          }
        });
      }
    });

    this.distribucion_dias = distribucion;
    console.log("Distribución calculada: ", distribucion);
    this.actualizarGraficaLinea();
  }

  // Obtener materias por programa educativo
  public obtenerMateriasPorPrograma() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response: any) => {
        this.calcularMateriasPorPrograma(response);
      },
      (error: any) => {
        console.error("Error al obtener materias por programa: ", error);
        // Datos de ejemplo
        this.materias_por_programa = [
          { programa: 'Ingeniería en Ciencias de la Computación', total: 15 },
          { programa: 'Licenciatura en Ciencias de la Computación', total: 12 },
          { programa: 'Ingeniería en Tecnologías de la Información', total: 8 }
        ];
        this.actualizarGraficaBarras();
      }
    );
  }

  // Calcular materias por programa manualmente
  private calcularMateriasPorPrograma(materias: any[]) {
    const programas = [
      'Ingeniería en Ciencias de la Computación',
      'Licenciatura en Ciencias de la Computación',
      'Ingeniería en Tecnologías de la Información'
    ];

    const conteo: any[] = [];
    programas.forEach(programa => {
      const total = materias.filter((m: any) =>
        m.programa_educativo === programa
      ).length;
      conteo.push({ programa, total });
    });

    this.materias_por_programa = conteo;
    console.log("Materias por programa calculadas: ", conteo);
    this.actualizarGraficaBarras();
  }

  // ============ ACTUALIZAR GRÁFICAS ============

  // Actualizar gráfica de línea (materias por día)
  private actualizarGraficaLinea() {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const datos = dias.map(dia => this.distribucion_dias[dia] || 0);

    this.lineChartData = {
      ...this.lineChartData,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: datos
        }
      ]
    };
  }

  // Actualizar gráfica de barras (materias por programa)
  private actualizarGraficaBarras() {
    if (!this.materias_por_programa || this.materias_por_programa.length === 0) {
      return;
    }

    const labels = this.materias_por_programa.map(item => {
      // Acortar nombres largos para mejor visualización
      if (item.programa && item.programa.length > 25) {
        return item.programa.substring(0, 22) + '...';
      }
      return item.programa || 'Sin nombre';
    });

    const datos = this.materias_por_programa.map(item => item.total || 0);

    this.barChartData = {
      labels: labels,
      datasets: [
        {
          data: datos,
          label: 'Total de materias',
          backgroundColor: [
            '#0092B8',
            '#17a2b8',
            '#28a745'
          ],
          borderColor: [
            '#007bff',
            '#17a2b8',
            '#28a745'
          ],
          borderWidth: 1
        }
      ]
    };
  }

  // Actualizar gráficas de usuarios
  private actualizarGraficasUsuarios() {
    const adminCount = this.total_users.admins || 0;
    const maestroCount = this.total_users.maestros || 0;
    const alumnoCount = this.total_users.alumnos || 0;

    // Actualizar gráfica de pastel
    this.pieChartData = {
      ...this.pieChartData,
      datasets: [
        {
          ...this.pieChartData.datasets[0],
          data: [adminCount, maestroCount, alumnoCount]
        }
      ]
    };

    // Actualizar gráfica de dona
    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: [adminCount, maestroCount, alumnoCount]
        }
      ]
    };
  }

  // Método para recargar datos
  public recargarDatos() {
    this.cargandoUsuarios = true;
    this.cargandoMaterias = true;
    this.obtenerDatosGraficas();
  }
}
