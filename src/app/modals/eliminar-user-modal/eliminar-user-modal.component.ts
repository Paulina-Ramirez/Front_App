import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-eliminar-user-modal',
  templateUrl: './eliminar-user-modal.component.html',
  styleUrls: ['./eliminar-user-modal.component.scss']
})
export class EliminarUserModalComponent implements OnInit {

  public rol: string = "";

  constructor(
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
    private materiasService: MateriasService,
    private dialogRef: MatDialogRef<EliminarUserModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;
  }

  public cerrar_modal(){
    this.dialogRef.close({isDelete:false});
  }

  public eliminarUser(){
    if(this.rol == "administrador"){
      // Entonces elimina un administrador
      this.administradoresService.eliminarAdmin(this.data.id).subscribe(
        (response)=>{
            console.log(response);
            this.dialogRef.close({isDelete:true});
        }, (error)=>{
            console.error("Error al eliminar administrador:", error);
            this.dialogRef.close({isDelete:false});
        }
      );
    } else if(this.rol == "maestro"){
        // Entonces elimina un maestro
        this.maestrosService.eliminarMaestro(this.data.id).subscribe(
            (response)=>{
                console.log(response);
                this.dialogRef.close({isDelete:true});
            }, (error)=>{
                console.error("Error al eliminar maestro:", error);
                this.dialogRef.close({isDelete:false});
            }
        );
    } else if(this.rol == "alumno"){
        // Entonces elimina un alumno
        this.alumnosService.eliminarAlumnos(this.data.id).subscribe(
            (response)=>{
                console.log(response);
                this.dialogRef.close({isDelete:true});
            }, (error)=>{
                console.error("Error al eliminar alumno:", error);
                this.dialogRef.close({isDelete:false});
            }
        );
    } else if(this.rol == "materia"){  // AÑADIR ESTE CASO
        // Entonces elimina una materia
        this.materiasService.eliminarMateria(this.data.id).subscribe(
            (response)=>{
                console.log("Materia eliminada:", response);
                this.dialogRef.close({isDelete:true});
            }, (error)=>{
                console.error("Error al eliminar materia:", error);
                this.dialogRef.close({isDelete:false});
            }
        );
    } else {
        // Rol no reconocido
        console.error("Rol no reconocido:", this.rol);
        this.dialogRef.close({isDelete:false});
    }
  }
}
