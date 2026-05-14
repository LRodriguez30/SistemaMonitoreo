import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../app';

export interface MetricasResponse {
  idSucursal: string;
  fechaMetrica: string;
  idMetrica: string;
  tipoMetrica: string;
  valor: number;
}



@Injectable({ providedIn: 'root' })
export class MetricasService {

  private url = `${baseUrl}/api/MetricasOperativas`;

  constructor(private http: HttpClient) { }

  getMetricas() {
    return this.http.get<MetricasResponse[]>(`${this.url}`);
  }
}