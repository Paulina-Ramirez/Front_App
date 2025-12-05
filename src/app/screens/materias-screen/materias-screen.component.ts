import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_materias: any[] = [];

  //Para la tabla - definimos columnas base
  public baseColumns: string[] = ['nrc', 'nombre', 'seccion', 'dias', 'hora_inicio', 'hora_fin', 'salon', 'programa_educativo', 'profesor', 'creditos'];
  public displayedColumns: string[] = [];

  dataSource = new MatTableDataSource<DatosMateria>(this.lista_materias as DatosMateria[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public facadeService: FacadeService,
    public materiasService: MateriasService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    // Configurar columnas según el rol
    this.setDisplayedColumns();

    //Validar que haya inicio de sesión
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    //Obtener materias
    this.obtenerMaterias();

    // Configurar el filtro personalizado para buscar por nombre de materia y NRC
    this.dataSource.filterPredicate = (data: DatosMateria, filter: string) => {
      const nombreMateria = data.nombre.toLowerCase();
      const nrc = data.nrc.toString();
      const profesor = this.getNombreProfesor(data).toLowerCase();
      const programa = data.programa_educativo.toLowerCase();

      return nombreMateria.includes(filter.toLowerCase()) ||
             nrc.includes(filter) ||
             profesor.includes(filter.toLowerCase()) ||
             programa.includes(filter.toLowerCase());
    };
  }

  // Método para obtener nombre del profesor
  private getNombreProfesor(data: any): string {
    if (data.profesor) {
      if (typeof data.profesor === 'object' && data.profesor.user) {
        return `${data.profesor.user.first_name} ${data.profesor.user.last_name}`;
      } else if (typeof data.profesor === 'string') {
        return data.profesor;
      }
    }
    return '';
  }

  // Método para configurar columnas según el rol
  private setDisplayedColumns(): void {
    if (this.rol === 'administrador') {
      // Administrador ve todas las columnas incluyendo acciones
      this.displayedColumns = [...this.baseColumns, 'editar', 'eliminar'];
    } else {
      // Maestro u otros roles solo ven las columnas base
      this.displayedColumns = [...this.baseColumns];
    }
    console.log('Rol:', this.rol, 'Columnas:', this.displayedColumns);
  }

  // Método para aplicar el filtro
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Obtener materias
  public obtenerMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        this.lista_materias = response;
        console.log("Lista materias: ", this.lista_materias);

        if (this.lista_materias.length > 0) {
          // Procesar datos para mostrar correctamente
          this.lista_materias.forEach(materia => {
            // Formatear días si es un array
            if (Array.isArray(materia.dias)) {
              materia.dias_formatted = materia.dias.join(', ');
            } else {
              materia.dias_formatted = materia.dias || '';
            }

            // Formatear profesor
            materia.profesor_nombre = this.getNombreProfesor(materia);
          });

          this.dataSource.data = this.lista_materias as DatosMateria[];
        }
      }, (error) => {
        console.error("Error al obtener la lista de materias: ", error);
        alert("No se pudo obtener la lista de materias");
      }
    );
  }

  public goEditar(idMateria: number) {
    this.router.navigate(["registro-materias/" + idMateria]);
  }

  public delete(idMateria: number) {
    // Solo administradores pueden eliminar materias
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idMateria, rol: 'materia'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result && result.isDelete){
          console.log("Materia eliminada correctamente");
          // Recargar la lista de materias
          this.obtenerMaterias();
        } else {
          console.log("Eliminación cancelada");
        }
      });
    } else {
      alert("No tienes permisos para eliminar materias.");
    }
  }
}

//Interfaz para los datos de materia
export interface DatosMateria {
  id: number;
  nrc: number | string;
  nombre: string;
  seccion: string;
  dias: string[];
  hora_inicio: string;
  hora_fin: string;
  salon: string;
  programa_educativo: string;
  profesor: any; // Puede ser string u objeto
  creditos: number | string;
  dias_formatted?: string;
  profesor_nombre?: string;
}
