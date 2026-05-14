import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../app';

export interface SesionesResponse {
  idUsuario: string;
  fechaInicio: string;
  idSesion: string;
  fechaFin: string;
  iP: string;
  estado: string;
  dispositivo: string;
}



@Injectable({ providedIn: 'root' })
export class SesionesService {

  private url = `${baseUrl}/api/SesionesUsuario`;

  constructor(private http: HttpClient) { }

  getSesiones() {
    return this.http.get<SesionesResponse[]>(`${this.url}`);
  }
}