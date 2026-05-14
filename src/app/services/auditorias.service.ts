import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../app';

export interface AuditoriasResponse {
  entidad: string;
  idEntidad: string;
  fechaAuditoria: string;
  idAuditoria: string;
  idUsuario: string;
  accion: string;
  datosAnteriores: string;
  datosNuevos: string;
}



@Injectable({ providedIn: 'root' })
export class AuditoriasService {

  private url = `${baseUrl}/api/AuditoriasOperativas`;

  constructor(private http: HttpClient) { }

  getAuditorias() {
    return this.http.get<AuditoriasResponse[]>(`${this.url}`);
  }
}