import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../app';

export interface SistemaResponse {
  idServidor: string;
  fechaEvento: string;
  idMonitoreo: string;
  idEvento: string;
  cPUuso: number;
  rAMuso: number;
  almacenamientoUso: number;
  estado: string;
}



@Injectable({ providedIn: 'root' })
export class SistemaService {

  private url = `${baseUrl}/api/MonitoreosSistema`;

  constructor(private http: HttpClient) { }

  getMetricas() {
    return this.http.get<SistemaResponse[]>(`${this.url}`);
  }
}