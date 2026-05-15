import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../app';

export interface VentasResponse {
  idSucursal: string;
  fechaVenta: string;
  idVenta: string;
  idCliente: string;
  metodoPago: string;
  total: number;
  cantidadProductos: number;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
  creadoPor: string;
  actualizadoPor: string;
}

export interface CreateVenta {
  idSucursal: string;
  idCliente: string;
  metodoPago: string;
  total: number;
  cantidadProductos: number;
  estado: string;
  creadoPor: string;
}

export interface UpdateVenta {
  idCliente: string;
  metodoPago: string;
  total: number;
  cantidadProductos: number;
  estado: string;
  creadoPor: string;
  actualizadoPor: string;
}


@Injectable({ providedIn: 'root' })
export class VentasService {

  private url = `${baseUrl}/api/VentasSucursal`;

  constructor(private http: HttpClient) { }

  getVentas() {
    return this.http.get<VentasResponse[]>(`${this.url}`);
  }

  createVenta(data: CreateVenta) {
    return this.http.post(`${this.url}`, data);
  }

  deleteVenta(idSucursal: string, idVenta: string) {
    return this.http.delete(`${this.url}/${idSucursal}/${idVenta}`);
  }

  updateVenta(idSucursal: string, idVenta: string, data: UpdateVenta) {
    return this.http.put(`${this.url}/${idSucursal}/${idVenta}`, data);
  }
}