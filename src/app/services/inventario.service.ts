import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../app';

export interface InventarioResponse {
  idProducto: string;
  fechaEvento: string;
  idEvento: string;
  idSucursal: string;
  TipoEvento: string;
  cantidad: number;
  idUsuario: string;
  observacion: string | null;
}

export interface CreateInventario {
  idProducto: string;
  idSucursal: string;
  tipoEvento: string;
  cantidad: number;
  idUsuario: string;
  observacion: string | null;
}

export interface UpdateInventario {
  tipoEvento: string;
  cantidad: number;
  idUsuario: string;
  observacion: string | null;
}


@Injectable({ providedIn: 'root' })
export class InventarioService {

  private url = `${baseUrl}/api/EventosInventario`;

  constructor(private http: HttpClient) { }

  getEventoInventario() {
    return this.http.get<InventarioResponse[]>(`${this.url}`);
  }

  createInventario(data: CreateInventario) {
    return this.http.post(`${this.url}`, data);
  }

  deleteInventario(idProducto: string, idEvento: string) {
    return this.http.delete(`${this.url}/${idProducto}/${idEvento}`);
  }

  updateInventario(idProducto: string, idEvento: string, data: UpdateInventario) {
    return this.http.put(`${this.url}/${idProducto}/${idEvento}`, data);
  }
}