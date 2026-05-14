import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { MetricasResponse, MetricasService } from '../../services/metricas.service';

@Component({
    selector: 'app-metricas',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './metricas.html'
})
export class Metricas {

    isLoaded = signal(false);

    displayedColumns: string[] = [
        'fechaMetrica',
        'idMetrica',
        'idSucursal',
        'tipoMetrica',
        'valor',
        'actions'
    ];

    columnLabels: Record<string, string> = {
        fechaMetrica: 'FECHA MÉTRICA',
        idMetrica: 'ID MÉTRICA',
        idSucursal: 'ID SUCURSAL',
        tipoMetrica: 'TIPO MÉTRICA',
        valor: 'VALOR',
        actions: 'ACCIONES'
    };

    columnConfig: Record<string, { type: string }> = {
        fechaMetrica: { type: 'datetime' },
        idMetrica: { type: 'id' },
        idSucursal: { type: 'text' },
        tipoMetrica: { type: 'badge' },
        valor: { type: 'number' },
        actions: { type: 'actions' }
    };

    dataSource = new MatTableDataSource<MetricasResponse>();

    constructor(
        private readonly metricasService: MetricasService
    ) {
        this.loadData();
    }

    // =========================
    // DATA
    // =========================

    loadData() {

        this.isLoaded.set(false);

        this.metricasService.getMetricas().subscribe({

            next: (data) => {

                this.dataSource.data = data;

                this.isLoaded.set(true);

                this.dataSource._updateChangeSubscription();
            },

            error: (err) => {

                console.error('Error cargando métricas', err);

                this.isLoaded.set(false);
            }
        });
    }

    // =========================
    // ACTIONS
    // =========================

    updateMetrica(row: MetricasResponse) {
        console.log('Actualizar', row);
    }

    deleteMetrica(row: MetricasResponse) {
        console.log('Eliminar', row);
    }

    // =========================
    // NORMALIZADOR
    // =========================

    private normalize(value: string): string {
        return (value ?? '')
            .toUpperCase()
            .replace(/\s+/g, '_')
            .trim();
    }

    // =========================
    // TIPO MÉTRICA (ENUM VISUAL)
    // =========================

    getTipoMetricaClass(tipo: string): string {

        switch (this.normalize(tipo)) {

            case 'VENTAS_DIA':
                return 'bg-violet-700/90 text-violet-50';

            case 'CLIENTES':
                return 'bg-blue-700/90 text-blue-50';

            case 'TICKETS':
                return 'bg-amber-700/90 text-amber-50';

            case 'INGRESOS':
                return 'bg-emerald-700/90 text-emerald-50';

            case 'DEVOLUCIONES':
                return 'bg-rose-700/90 text-rose-50';

            default:
                return 'bg-slate-700/90 text-slate-50';
        }
    }

    getTipoMetricaIcon(tipo: string): string {

        switch (this.normalize(tipo)) {

            case 'VENTAS_DIA':
                return 'trending_up';

            case 'CLIENTES':
                return 'people';

            case 'TICKETS':
                return 'confirmation_number';

            case 'INGRESOS':
                return 'payments';

            case 'DEVOLUCIONES':
                return 'undo';

            default:
                return 'analytics';
        }
    }

    getTipoMetricaLabel(tipo: string): string {

        switch (this.normalize(tipo)) {

            case 'VENTAS_DIA':
                return 'Ventas del Día';

            case 'CLIENTES':
                return 'Clientes';

            case 'TICKETS':
                return 'Tickets';

            case 'INGRESOS':
                return 'Ingresos';

            case 'DEVOLUCIONES':
                return 'Devoluciones';

            default:
                return tipo;
        }
    }
}