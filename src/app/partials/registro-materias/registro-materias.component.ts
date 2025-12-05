import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MateriasService } from 'src/app/services/materias.service';
import { MatDialog } from '@angular/material/dialog';
import { ActualizarModalComponent } from 'src/app/modals/actualizar-modal/actualizar-modal.component';

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriasComponent implements OnInit {
  @Input() rol: string = "";
  @Input() datos_user: any = {};

  // Añade estas líneas después de las otras propiedades
  @ViewChild('timeInputInicio') timeInputInicio!: ElementRef<HTMLInputElement>;
  @ViewChild('timeInputFin') timeInputFin!: ElementRef<HTMLInputElement>;

  public materia:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idMateria: number = 0;
  public maestros: any[] = [];
  public cargando: boolean = false;
  public profesorSeleccionado: any = null;

  // Para el select de programa educativo
  public programasEducativos: any[] = [
    {value: 'Ingeniería en Ciencias de la Computación', viewValue: 'Ingeniería en Ciencias de la Computación'},
    {value: 'Licenciatura en Ciencias de la Computación', viewValue: 'Licenciatura en Ciencias de la Computación'},
    {value: 'Ingeniería en Tecnologías de la Información', viewValue: 'Ingeniería en Tecnologías de la Información'}
  ];

  // Para dias
  public diasSemana: any[] = [
    {nombre: 'Lunes', value: 'Lunes', seleccionado: false},
    {nombre: 'Martes', value: 'Martes', seleccionado: false},
    {nombre: 'Miércoles', value: 'Miércoles', seleccionado: false},
    {nombre: 'Jueves', value: 'Jueves', seleccionado: false},
    {nombre: 'Viernes', value: 'Viernes', seleccionado: false},
  ];

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private materiasService: MateriasService,
    public dialog: MatDialog
  ) { }


  ngOnInit(): void {
    // El primer if valida si existe un parámetro en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      // Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idMateria = Number(this.activatedRoute.snapshot.params['id']);
      console.log("ID Materia: ", this.idMateria);

      // Si estamos editando, debemos cargar los datos de la materia
      this.obtenerMateriaPorID();
    } else {
      // Si no va a editar, entonces inicializamos el JSON para registro nuevo
      this.materia = this.materiasService.esquemaMateria();
      // Inicializar días como array vacío
      this.materia.dias = [];
      this.token = this.facadeService.getSessionToken();
    }

    // Cargar lista de maestros
    this.listaMaestros();

    console.log("Materia inicial: ", this.materia);
  }

  // Obtener materia por ID
  public obtenerMateriaPorID(){
    this.cargando = true;
    console.log("Obteniendo materia con ID:", this.idMateria);

    this.materiasService.obtenerMateriaPorID(this.idMateria).subscribe(
      (response) => {
        console.log("Respuesta del servicio:", response);
        this.materia = response;

        // Asegurar que días sea un array
        if(!this.materia.dias || !Array.isArray(this.materia.dias)){
          this.materia.dias = [];
        }

        // Inicializar checkboxes de días basados en los datos
        this.inicializarCheckboxesDias();

        console.log("Materia cargada para editar: ", this.materia);
        console.log("Profesor de la materia: ", this.materia.profesor);

        this.cargando = false;
      },
      (error) => {
        console.error("Error al obtener materia: ", error);
        alert("No se pudieron cargar los datos de la materia");
        this.regresar();
        this.cargando = false;
      }
    );
  }

  // Inicializar checkboxes de días
  private inicializarCheckboxesDias() {
    if(this.materia.dias && Array.isArray(this.materia.dias)){
      this.diasSemana.forEach(dia => {
        dia.seleccionado = this.materia.dias.includes(dia.value);
      });
    }
  }

  public regresar(){
    this.location.back();
  }

  public openTimePicker(type: 'hora_inicio' | 'hora_fin'): void {
    let inputElement: HTMLInputElement | null = null;

    if (type === 'hora_inicio' && this.timeInputInicio) {
      inputElement = this.timeInputInicio.nativeElement;
    } else if (type === 'hora_fin' && this.timeInputFin) {
      inputElement = this.timeInputFin.nativeElement;
    }

    if (inputElement) {
      // Método moderno (Chrome, Edge, Safari)
      if (typeof inputElement.showPicker === 'function') {
        inputElement.showPicker();
      }
      // Método para Firefox y navegadores más antiguos
      else {
        inputElement.focus();
        // Forzar la apertura del timepicker en algunos navegadores
        inputElement.click();

        // Alternativa para móviles
        if ('ontouchstart' in window) {
          inputElement.setAttribute('type', 'text');
          setTimeout(() => {
            inputElement?.setAttribute('type', 'time');
            inputElement?.focus();
          }, 100);
        }
      }
    }
  }

  public registrar(){
    // Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);

    console.log("Errores de validación:", this.errors);

    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Asegurarse de que profesor sea solo el ID (no el objeto completo)
    this.prepararDatosParaEnvio();

    console.log("Datos a registrar:", this.materia);

    this.cargando = true;
    // Aquí llamas al servicio para registrar la materia
    this.materiasService.registrarMateria(this.materia).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Materia registrada exitosamente");
        console.log("Materia registrada: ", response);
        this.cargando = false;
        this.router.navigate(["materias"]);
      },
      (error) => {
        // Manejar errores de la API
        console.error("Error completo al registrar materia: ", error);
        alert("Error al registrar materia: " + (error.error?.message || error.message || 'Error desconocido'));
        this.cargando = false;
      }
    );
  }

  public actualizar(){
    console.log("Actualizando materia:", this.materia);

    // Validación de los datos
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);

    console.log("Errores de validación:", this.errors);

    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Mostrar modal de confirmación antes de actualizar
    this.mostrarModalConfirmacion();
  }

  // Nueva función para mostrar el modal de confirmación
  private mostrarModalConfirmacion() {
    const dialogRef = this.dialog.open(ActualizarModalComponent, {
      width: '400px',
      height: '280px',
      disableClose: true,
      panelClass: 'confirmar-actualizacion-modal-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isConfirmed) {
        this.ejecutarActualizacion();
      } else {
        console.log("Actualización cancelada por el usuario");
      }
    });
  }

  // Extraer la lógica de actualización a una función separada
  private ejecutarActualizacion() {
    // Asegurarse de que profesor sea solo el ID (no el objeto completo)
    this.prepararDatosParaEnvio();

    console.log("Datos a actualizar:", this.materia);

    this.cargando = true;
    // Ejecutamos el servicio de actualización
    this.materiasService.actualizarMateria(this.materia).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Materia actualizada exitosamente");
        console.log("Materia actualizada: ", response);
        this.cargando = false;
        this.router.navigate(["materias"]);
      },
      (error) => {
        // Manejar errores de la API
        console.error("Error completo al actualizar materia: ", error);
        alert("Error al actualizar materia: " + (error.error?.message || error.message || 'Error desconocido'));
        this.cargando = false;
      }
    );
  }

  // Preparar datos para enviar al backend
  private prepararDatosParaEnvio() {
    // Si profesor es un objeto (cuando se edita), extraer solo el ID
    if (this.materia.profesor && typeof this.materia.profesor === 'object') {
      console.log("Profesor es objeto:", this.materia.profesor);
      // Extraer ID del objeto profesor
      if (this.materia.profesor.id) {
        this.materia.profesor = this.materia.profesor.id;
      } else if (this.materia.profesor.id_maestro) {
        this.materia.profesor = this.materia.profesor.id_maestro;
      }
    }

    // Si profesorSeleccionado tiene valor, usar su ID
    if (this.profesorSeleccionado && this.profesorSeleccionado.id) {
      this.materia.profesor = this.profesorSeleccionado.id;
    }

    console.log("Profesor ID para enviar:", this.materia.profesor);
  }

  // Cargar lista de maestros
  listaMaestros() {
    console.log("Cargando lista de maestros...");

    this.materiasService.obtenerListaMaestros().subscribe(
      (response) => {
        this.maestros = response;
        console.log("Maestros cargados: ", this.maestros);

        // Procesamos los datos de los maestros
        if (this.maestros.length > 0) {
          this.maestros.forEach(maestro => {
            maestro.first_name = maestro.user.first_name;
            maestro.last_name = maestro.user.last_name;
            // Crear nombre_completo para el select
            maestro.nombre_completo = `${maestro.first_name} ${maestro.last_name}`;
            // Asegurar que tengamos ID
            maestro.id_maestro = maestro.id || maestro.id_maestro;
          });
        }

        // Si estamos editando y ya tenemos los datos de la materia,
        // establecer el maestro seleccionado
        if (this.editar && this.materia.profesor) {
          this.seleccionarMaestroPorId();
        }
      },
      (error) => {
        console.error("Error al cargar maestros: ", error);
        this.maestros = [];
      }
    );
  }

  // Seleccionar maestro por ID cuando estamos editando
  private seleccionarMaestroPorId() {
    console.log("Buscando profesor con ID:", this.materia.profesor);

    // Si profesor es un objeto, extraer el ID
    let profesorId = this.materia.profesor;
    if (typeof this.materia.profesor === 'object') {
      profesorId = this.materia.profesor.id || this.materia.profesor.id_maestro;
    }

    console.log("ID del profesor a buscar:", profesorId);

    // Buscar el maestro en la lista
    const maestroEncontrado = this.maestros.find(m =>
      m.id === profesorId ||
      m.id_maestro === profesorId ||
      m.id == profesorId
    );

    if (maestroEncontrado) {
      console.log("Maestro encontrado:", maestroEncontrado);
      this.profesorSeleccionado = maestroEncontrado;
      this.materia.profesor = maestroEncontrado.id_maestro || maestroEncontrado.id;
    } else {
      console.warn("No se encontró el maestro con ID:", profesorId);
    }
  }

  // Método cuando se selecciona un maestro en el dropdown
  public onSeleccionarMaestro(event: any) {
    const maestroId = event.value;
    console.log("Maestro seleccionado ID:", maestroId);

    // Buscar el maestro completo en la lista
    this.profesorSeleccionado = this.maestros.find(m =>
      m.id === maestroId ||
      m.id_maestro === maestroId ||
      m.id == maestroId
    );

    if (this.profesorSeleccionado) {
      console.log("Maestro seleccionado:", this.profesorSeleccionado);
      this.materia.profesor = this.profesorSeleccionado.id_maestro || this.profesorSeleccionado.id;
    }
  }

  // Obtener nombre del profesor para mostrar
  public getNombreProfesor(): string {
    if (this.profesorSeleccionado) {
      return this.profesorSeleccionado.nombre_completo;
    } else if (this.materia.profesor && typeof this.materia.profesor === 'object') {
      // Si profesor es objeto (cuando se carga para editar)
      if (this.materia.profesor.user) {
        return `${this.materia.profesor.user.first_name} ${this.materia.profesor.user.last_name}`;
      } else if (this.materia.profesor.first_name) {
        return `${this.materia.profesor.first_name} ${this.materia.profesor.last_name}`;
      }
    } else if (this.materia.profesor && typeof this.materia.profesor === 'number') {
      // Buscar en la lista de maestros
      const maestro = this.maestros.find(m =>
        m.id === this.materia.profesor ||
        m.id_maestro === this.materia.profesor
      );
      if (maestro) {
        return maestro.nombre_completo;
      }
    }

    return '';
  }

  // Funciones para los checkbox de días
  public checkboxChange(event:any){
    console.log("Evento checkbox: ", event);
    const diaSeleccionado = event.source.value;

    if(event.checked){
      if(!this.materia.dias){
        this.materia.dias = [];
      }
      if(!this.materia.dias.includes(diaSeleccionado)){
        this.materia.dias.push(diaSeleccionado);
      }
    } else {
      if(this.materia.dias){
        const index = this.materia.dias.indexOf(diaSeleccionado);
        if(index !== -1){
          this.materia.dias.splice(index, 1);
        }
      }
    }

    // Actualizar estado del checkbox en el array
    const diaCheckbox = this.diasSemana.find(d => d.value === diaSeleccionado);
    if(diaCheckbox){
      diaCheckbox.seleccionado = event.checked;
    }

    console.log("Días actuales: ", this.materia.dias);
  }

  public revisarSeleccion(dia: string){
    if(this.materia.dias && Array.isArray(this.materia.dias)){
      return this.materia.dias.includes(dia);
    }
    return false;
  }

  // Función para validar solo números
  public soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo números (0-9)
    if (
      !(charCode >= 48 && charCode <= 57) &&  // Números
      charCode !== 8 &&  // Backspace
      charCode !== 9 &&  // Tab
      charCode !== 13 && // Enter
      charCode !== 46    // Delete
    ) {
      event.preventDefault();
    }
  }

  // Función para validar letras y espacios
  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32 &&                      // Espacio
      charCode !== 8 &&                       // Backspace
      charCode !== 9 &&                       // Tab
      charCode !== 13 &&                      // Enter
      charCode !== 46                         // Delete
    ) {
      event.preventDefault();
    }
  }
}
