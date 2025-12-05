import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-registro-materias-screen',
  templateUrl: './registro-materias-screen.component.html',
  styleUrls: ['./registro-materias-screen.component.scss']
})
export class RegistroMateriasScreenComponent implements OnInit {

  public rol: string = "";

  constructor(
    private facadeService: FacadeService,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.rol = this.facadeService.getUserGroup();
  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }

}
