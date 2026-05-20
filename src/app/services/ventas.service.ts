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

export interface VentaFilter {
    estado: string[];
    metodoPago: string[];
    total: { min: number | null; max: number | null };
    fechaVenta: { from: string; to: string; }
    idSucursal: string;
    idVenta: string;
    idCliente: string;
}

export enum EstadoVenta {
  PENDIENTE = "PENDIENTE",
  PAGADA = "PAGADA",
  PROCESANDO = "PROCESANDO",
  COMPLETADA = "COMPLETADA",
  CANCELADA = "CANCELADA",
  ANULADA = "ANULADA",
  REEMBOLSADA = "REEMBOLSADA",
  DEVUELTA = "DEVUELTA"
}

export enum MetodoDePago {
  EFECTIVO = "EFECTIVO",
  TARJETA_CREDITO = "TARJETA_CREDITO",
  TARJETA_DEBITO = "TARJETA_DEBITO",
  TRANSFERENCIA_BANCARIA = "TRANSFERENCIA_BANCARIA",
  CHEQUE = "CHEQUE",
  OTRO = "OTRO"
}

export interface VentaEnums {
  estadoVenta: EstadoVenta;
  metodoPago: MetodoDePago;
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