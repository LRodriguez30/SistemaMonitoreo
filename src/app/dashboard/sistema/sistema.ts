import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SistemaResponse, SistemaService } from '../../services/sistema.service';

@Component({
    selector: 'app-sistema',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './sistema.html'
})
export class Sistema {

    isLoaded = signal(false);

    displayedColumns: string[] = [
        'idServidor',
        'fechaEvento',
        'idMonitoreo',
        'idEvento',
        'cpUuso',
        'raMuso',
        'almacenamientoUso',
        'estado',
        'actions'
    ];

    columnLabels: Record<string, string> = {
        idServidor: 'ID SERVIDOR',
        fechaEvento: 'FECHA EVENTO',
        idMonitoreo: 'ID MONITOREO',
        idEvento: 'ID EVENTO',
        cpUuso: 'CPU',
        raMuso: 'RAM',
        almacenamientoUso: 'ALMACENAMIENTO %',
        estado: 'ESTADO',
        actions: 'ACCIONES'
    };

    columnConfig: Record<string, { type: string }> = {
        idServidor: { type: 'id' },
        fechaEvento: { type: 'datetime' },
        idMonitoreo: { type: 'id' },
        idEvento: { type: 'id' },
        cpUuso: { type: 'number' },
        raMuso: { type: 'number' },
        almacenamientoUso: { type: 'number' },
        estado: { type: 'status' },
        actions: { type: 'actions' }
    };

    dataSource = new MatTableDataSource<SistemaResponse>();

    constructor(
        private readonly sistemaService: SistemaService
    ) {
        this.loadData();
    }

    // =========================
    // DATA
    // =========================
    loadData() {

        this.isLoaded.set(false);

        this.sistemaService.getMetricas().subscribe({

            next: (data) => {
                this.dataSource.data = data;
                this.isLoaded.set(true);
                this.dataSource._updateChangeSubscription();
            },

            error: (err) => {
                console.error('Error cargando métricas del sistema', err);
                this.isLoaded.set(false);
            }
        });
    }

    // =========================
    // ACTIONS
    // =========================
    updateSistema(row: SistemaResponse) {
        console.log('Actualizar', row);
    }

    deleteSistema(row: SistemaResponse) {
        console.log('Eliminar', row);
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
    // ESTADO SERVIDOR (ENUM)
    // =========================
    getEstadoClass(estado: string): string {

        switch (this.normalize(estado)) {

            case 'ACTIVO':
                return 'bg-emerald-700/90 text-emerald-50';

            case 'INACTIVO':
                return 'bg-zinc-700/90 text-zinc-50';

            case 'MANTENIMIENTO':
                return 'bg-amber-700/90 text-amber-50';

            case 'ERROR':
                return 'bg-rose-700/90 text-rose-50';

            case 'NO_DISPONIBLE':
                return 'bg-slate-700/90 text-slate-50';

            default:
                return 'bg-slate-600/80 text-slate-50';
        }
    }

    getEstadoIcon(estado: string): string {

        switch (this.normalize(estado)) {

            case 'ACTIVO':
                return 'check_circle';

            case 'INACTIVO':
                return 'pause_circle';

            case 'MANTENIMIENTO':
                return 'build';

            case 'ERROR':
                return 'error';

            case 'NO_DISPONIBLE':
                return 'cloud_off';

            default:
                return 'help';
        }
    }

    getEstadoLabel(estado: string): string {

        switch (this.normalize(estado)) {

            case 'ACTIVO':
                return 'Activo';

            case 'INACTIVO':
                return 'Inactivo';

            case 'MANTENIMIENTO':
                return 'Mantenimiento';

            case 'ERROR':
                return 'Error';

            case 'NO_DISPONIBLE':
                return 'No disponible';

            default:
                return estado;
        }
    }
}