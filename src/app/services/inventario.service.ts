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



@Injectable({ providedIn: 'root' })
export class InventarioService {

  private url = `${baseUrl}/api/EventosInventario`;

  constructor(private http: HttpClient) { }

  getEventoInventario() {
    return this.http.get<InventarioResponse[]>(`${this.url}`);
  }
}