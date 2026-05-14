import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SesionesResponse, SesionesService } from '../../services/sesiones.service';

export type EstadoSesion =
    | 'ACTIVA'
    | 'EXPIRADA'
    | 'CERRADA'
    | 'REVOCADA'
    | 'BLOQUEADA';

@Component({
    selector: 'app-sesiones',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './sesiones.html'
})
export class Sesiones {

    isLoaded = signal(false);

    displayedColumns: string[] = [
        'idSesion',
        'idUsuario',
        'fechaInicio',
        'fechaFin',
        'estado',
        'iP',
        'dispositivo',
        'actions'
    ];

    columnLabels: Record<string, string> = {
        idSesion: 'ID SESIÓN',
        idUsuario: 'ID USUARIO',
        fechaInicio: 'FECHA INICIO',
        fechaFin: 'FECHA FIN',
        estado: 'ESTADO',
        iP: 'IP',
        dispositivo: 'DISPOSITIVO',
        actions: 'ACCIONES'
    };

    columnConfig: Record<string, { type: string }> = {
        idSesion: { type: 'id' },
        idUsuario: { type: 'user' },
        fechaInicio: { type: 'datetime' },
        fechaFin: { type: 'datetime' },
        estado: { type: 'status' },
        iP: { type: 'text' },
        dispositivo: { type: 'text' },
        actions: { type: 'actions' }
    };

    dataSource = new MatTableDataSource<SesionesResponse>();

    constructor(
        private readonly sesionesService: SesionesService
    ) {
        this.loadData();
    }

    // =========================
    // DATA
    // =========================

    loadData() {

        this.isLoaded.set(false);

        this.sesionesService.getSesiones().subscribe({

            next: (data) => {

                this.dataSource.data = data;

                this.isLoaded.set(true);

                this.dataSource._updateChangeSubscription();
            },

            error: (err) => {

                console.error('Error cargando sesiones', err);

                this.isLoaded.set(false);
            }
        });
    }

    // =========================
    // ACTIONS
    // =========================

    updateSesion(row: SesionesResponse) {
        console.log('Actualizar sesión', row);
    }

    deleteSesion(row: SesionesResponse) {
        console.log('Eliminar sesión', row);
    }

    // =========================
    // NORMALIZER
    // =========================

    private normalize(value: string): string {
        return (value ?? '')
            .toUpperCase()
            .replace(/\s+/g, '_')
            .trim();
    }

    // =========================
    // ESTADO SESIÓN
    // =========================

    getEstadoClass(estado: string): string {

        switch (this.normalize(estado)) {

            case 'ACTIVA':
                return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60';

            case 'EXPIRADA':
                return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200';

            case 'CERRADA':
                return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60';

            case 'REVOCADA':
                return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60';

            case 'BLOQUEADA':
                return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60';

            default:
                return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
        }
    }

    getEstadoIcon(estado: string): string {

        switch (this.normalize(estado)) {

            case 'ACTIVA':
                return 'check_circle';

            case 'EXPIRADA':
                return 'schedule';

            case 'CERRADA':
                return 'logout';

            case 'REVOCADA':
                return 'block';

            case 'BLOQUEADA':
                return 'lock';

            default:
                return 'help';
        }
    }

    getEstadoLabel(estado: string): string {

        switch (this.normalize(estado)) {

            case 'ACTIVA':
                return 'Activa';

            case 'EXPIRADA':
                return 'Expirada';

            case 'CERRADA':
                return 'Cerrada';

            case 'REVOCADA':
                return 'Revocada';

            case 'BLOQUEADA':
                return 'Bloqueada';

            default:
                return estado;
        }
    }

    // =========================
    // DISPOSITIVO (base preparado)
    // =========================

    getDispositivoLabel(dispositivo: string): string {
        return dispositivo ?? 'Desconocido';
    }
}