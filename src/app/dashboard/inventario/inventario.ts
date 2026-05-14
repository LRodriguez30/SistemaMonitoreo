import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
    InventarioResponse,
    InventarioService
} from '../../services/inventario.service';

@Component({
    selector: 'app-inventario',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './inventario.html'
})
export class Inventario {

    isLoaded = signal(false);

    displayedColumns: string[] = [
        'idProducto',
        'fechaEvento',
        'idEvento',
        'idSucursal',
        'tipoEvento',
        'cantidad',
        'idUsuario',
        'observacion',
        'actions'
    ];

    columnLabels: Record<string, string> = {
        idProducto: 'ID PRODUCTO',
        fechaEvento: 'FECHA EVENTO',
        idEvento: 'ID EVENTO',
        idSucursal: 'ID SUCURSAL',
        tipoEvento: 'TIPO EVENTO',
        cantidad: 'CANTIDAD',
        idUsuario: 'ID USUARIO',
        observacion: 'OBSERVACIÓN',
        actions: 'ACCIONES'
    };

    columnConfig: Record<string, { type: string }> = {
        idProducto: { type: 'id' },
        fechaEvento: { type: 'datetime' },
        idEvento: { type: 'id' },
        idSucursal: { type: 'id' },
        tipoEvento: { type: 'status' },
        cantidad: { type: 'number' },
        idUsuario: { type: 'user' },
        observacion: { type: 'text' },
        actions: { type: 'actions' }
    };

    dataSource = new MatTableDataSource<InventarioResponse>();

    constructor(
        private readonly inventarioService: InventarioService
    ) {
        this.loadData();
    }

    updateEventoInventario(row: InventarioResponse) {
        console.log('Actualizar', row);
    }

    deleteEventoInventario(row: InventarioResponse) {
        console.log('Eliminar', row);
    }

    loadData() {

        this.isLoaded.set(false);

        this.inventarioService.getEventoInventario().subscribe({

            next: (data) => {

                this.dataSource.data = data;

                console.log(data);

                this.isLoaded.set(true);

                this.dataSource._updateChangeSubscription();
            },

            error: (err) => {

                console.error('Error cargando inventario', err);

                this.isLoaded.set(false);
            }
        });
    }

    getTipoEventoClass(tipo: string): string {

        switch (tipo) {

            case 'ENTRADA':
                return `
                    bg-emerald-50
                    text-emerald-700
                    ring-1 ring-emerald-200/60
                `;

            case 'SALIDA':
                return `
                    bg-rose-50
                    text-rose-700
                    ring-1 ring-rose-200/60
                `;

            case 'AJUSTE':
                return `
                    bg-amber-50
                    text-amber-700
                    ring-1 ring-amber-200/60
                `;

            case 'DEVOLUCION':
                return `
                    bg-sky-50
                    text-sky-700
                    ring-1 ring-sky-200/60
                `;

            case 'TRANSFERENCIA':
                return `
                    bg-violet-50
                    text-violet-700
                    ring-1 ring-violet-200/60
                `;

            default:
                return `
                    bg-slate-100
                    text-slate-600
                    ring-1 ring-slate-200
                `;
        }
    }
}