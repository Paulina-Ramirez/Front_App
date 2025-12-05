import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MaestrosService } from './maestros.service';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService
  ) { }

  public esquemaMateria(){
    return {
      'nrc':'',
      'nombre': '',
      'seccion': '',
      'dias': [],
      'hora_inicio': '',
      'hora_fin': '',
      'salon': '',
      'programa_educativo': '',
      'profesor': '',
      'creditos': ''
    }
  }

  //Validación para el formulario
  public validarMateria(data: any, editar: boolean){
    console.log("Validando materia... ", data);
    let error: any = [];

    // Validación para NRC
    if(!this.validatorService.required(data["nrc"])){
      error["nrc"] = this.errorService.required;
    }else if(!this.validatorService.numeric(data["nrc"])){
      error["nrc"] = this.errorService.numeric;
    }else if(!this.validatorService.min(data["nrc"], 5)){  // Longitud minia de 5
      error["nrc"] = this.errorService.min(5);
    }else if(!this.validatorService.max(data["nrc"], 6)){  // Longitud maxima de 6
      error["nrc"] = this.errorService.max(6);
    }

    // Validación para nombre
    if(!this.validatorService.required(data["nombre"])){
      error["nombre"] = this.errorService.required;
    }

    // Validación para sección
    if(!this.validatorService.required(data["seccion"])){
      error["seccion"] = this.errorService.required;
    }else if(!this.validatorService.numeric(data["seccion"])){
      error["seccion"] = this.errorService.numeric;
    }else if(!this.validatorService.max(data["seccion"], 3)){
      error["seccion"] = this.errorService.max(3);
    }

    // Validación para días
    if(!data["dias"] || data["dias"].length === 0){
      error["dias"] = "Debes seleccionar al menos un día";
    }

    // Validación para horario
    if(!this.validatorService.required(data["hora_inicio"])){
      error["hora_inicio"] = this.errorService.required;
    }
    if(!this.validatorService.required(data["hora_fin"])){
      error["hora_fin"] = this.errorService.required;
    }
    // Validar que hora inicio sea menor que hora fin
    if(data["hora_inicio"] && data["hora_fin"] && data["hora_inicio"] >= data["hora_fin"]){
      error["horario"] = "La hora de inicio debe ser menor que la hora de fin";
    }

    // Validación para salón
    if(!this.validatorService.required(data["salon"])){
      error["salon"] = this.errorService.required;
    }else if(!this.validatorService.max(data["salon"], 15)){
      error["salon"] = this.errorService.max(15);
    }

    // Validación para programa educativo
    if(!this.validatorService.required(data["programa_educativo"])){
      error["programa_educativo"] = this.errorService.required;
    }

    // Validación para profesor
    if(!this.validatorService.required(data["profesor"])){
      error["profesor"] = this.errorService.required;
    }

    // Validación para créditos
    if(!this.validatorService.required(data["creditos"])){
      error["creditos"] = this.errorService.required;
    }else if(!this.validatorService.numeric(data["creditos"])){
      error["creditos"] = this.errorService.numeric;
    }else if(!this.validatorService.max(data["creditos"], 2)){
      error["creditos"] = this.errorService.max(2);
    }

    //Return arreglo
    return error;
  }

  //Servicio para registrar una nueva materia
  public registrarMateria (data: any): Observable <any>{
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  // Obtener lista de materias
  public obtenerListaMaterias(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers });
  }

  // Servicio para obtener una materia por ID
  public obtenerMateriaPorID(idMateria: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
        headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
        headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        console.log("No se encontró el token del usuario");
    }
    // CORREGIDO: Usar query string como espera el backend
    return this.http.get<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
}

  // Servicio para actualizar una materia
  public actualizarMateria(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.put<any>(`${environment.url_api}/materias/`, data, { headers });
  }

  //Servicio para eliminar una materia
  public eliminarMateria(idMateria: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
        headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
        headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    // CORREGIDO: Usar query string como espera el backend
    return this.http.delete<any>(`${environment.url_api}/materias/?id=${idMateria}`, { headers });
}
  // Servicio para obtener lista de maestros
  public obtenerListaMaestros(): Observable<any>{
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-maestros/`, { headers });
  }
}
