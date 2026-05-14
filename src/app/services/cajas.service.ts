import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../app';

export interface CajasResponse {
  idCaja: string;
  fechaEvento: string;
  idEvento: string;
  idUsuario: string;
  tipoEvento: string;
  monto: number;
  descripcion: string | null;
}

export interface CreateCaja {
  idCaja: string;
  idUsuario: string;
  tipoEvento: string;
  monto: number;
  descripcion: string | null;
}

export interface UpdateCaja {
  tipoEvento: string;
  monto: number;
  descripcion: string | null;
}


@Injectable({ providedIn: 'root' })
export class CajasService {

  private url = `${baseUrl}/api/EventosCajas`;

  constructor(private http: HttpClient) { }

  getCajas() {
    return this.http.get<CajasResponse[]>(`${this.url}`);
  }

  createCaja(data: CreateCaja) {
    return this.http.post(`${this.url}`, data);
  }

  deleteCaja(idCaja: string, idEvento: string) {
    return this.http.delete(`${this.url}/${idCaja}/${idEvento}`);
  }

  updateCaja(idCaja: string, idEvento: string, data: UpdateCaja) {
    return this.http.put(`${this.url}/${idCaja}/${idEvento}`, data);
  }
}