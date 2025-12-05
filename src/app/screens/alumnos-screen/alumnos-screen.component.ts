import { Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import {  AlumnosService } from 'src/app/services/alumnos.service';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})

export class AlumnosScreenComponent implements OnInit, AfterViewInit { // Agregar AfterViewInit

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  //Para la tabla
  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'curp', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  // Para el sorting
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    // Configurar el filtro personalizado para buscar por nombre completo
    this.dataSource.filterPredicate = (data: DatosUsuario, filter: string) => {
      const nombreCompleto = `${data.first_name} ${data.last_name}`.toLowerCase();
      return nombreCompleto.includes(filter.toLowerCase());
    };

    //Obtener alumnos
    this.obtenerAlumnos();
  }

  // Método para aplicar el filtro
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Consumimos el servicio para obtener los alumnos
  //Obtener alumnos
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          //Agregar datos del nombre e email
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Alumnos: ", this.lista_alumnos);

          // CORRECCIÓN: No crear nuevo dataSource, solo actualizar los datos
          this.dataSource.data = this.lista_alumnos as DatosUsuario[];

          // Configurar el sorting después de cargar los datos
          if (this.dataSource.sort) {
            this.dataSource.sort.sortChange.emit();
          }
        }
      }, (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumno/" + idUser]);
  }

  public delete(idUser: number) {
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    const userId = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || (this.rol === 'maestro' && userId === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'alumno'}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        console.log("Alumno eliminado");
        alert("Alumno eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Alumno no se ha podido eliminar.");
        console.log("No se eliminó el alumno");
      }
    });
    }else{
      alert("No tienes permisos para eliminar este alumno.");
    }

  }

}
//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  id: number,
  matricula: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  curp: string
}
