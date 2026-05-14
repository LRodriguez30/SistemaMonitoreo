import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../app';

export interface LogsResponse {
  idUsuario: string;
  fechaLog: string;
  idLog: string;
  modulo: string;
  accion: string;
  iP: string;
  dispositivo: string;
  descripcion: string | null;
}



@Injectable({ providedIn: 'root' })
export class LogsService {

  private url = `${baseUrl}/api/LogsActividad`;

  constructor(private http: HttpClient) { }

  getLogsActividad() {
    return this.http.get<LogsResponse[]>(`${this.url}`);
  }
}