import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { VentasResponse, VentasService } from '../../services/ventas.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-ventas',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './ventas.html'
})
export class Ventas {
    isLoaded = signal(false);
    displayedColumns: string[] = [
        'idSucursal',
        'fechaVenta',
        'idVenta',
        'idCliente',
        'metodoPago',
        'total',
        'cantidadProductos',
        'estado',
        'creadoEn',
        'actualizadoEn',
        'creadoPor',
        'actualizadoPor',
        'actions'
    ];
    columnLabels: Record<string, string> = {
        idSucursal: 'ID SUCURSAL',
        fechaVenta: 'FECHA',
        idVenta: 'ID VENTA',
        idCliente: 'ID CLIENTE',
        metodoPago: 'MÉTODO DE PAGO',
        total: 'TOTAL',
        cantidadProductos: 'CANTIDAD VENDIDA',
        estado: 'ESTADO DE VENTA',
        creadoEn: 'CREADO EN',
        actualizadoEn: 'ACTUALIZADO EN',
        creadoPor: 'CREADO POR',
        actualizadoPor: 'ACTUALIZADO POR',
        actions: 'ACCIONES'
    };
    columnConfig: Record<string, { type: string }> = {
        idSucursal: { type: 'text' },
        fechaVenta: { type: 'date' },
        idVenta: { type: 'id' },
        idCliente: { type: 'text' },
        metodoPago: { type: 'badge' },
        total: { type: 'currency' },
        cantidadProductos: { type: 'number' },
        estado: { type: 'status' },
        creadoEn: { type: 'datetime' },
        actualizadoEn: { type: 'datetime' },
        creadoPor: { type: 'user' },
        actualizadoPor: { type: 'user' },
        actions: { type: 'actions' }
    };
    dataSource = new MatTableDataSource<VentasResponse>();

    constructor(
        private readonly ventasService: VentasService
    ) {
        this.loadData();
    }

    updateVenta(row: VentasResponse) {
        console.log('Actualizar', row);
    }

    deleteVenta(row: VentasResponse) {
        console.log('Eliminar', row);
    }

    loadData() {
        this.isLoaded.set(false);

        this.ventasService.getVentas().subscribe({
            next: (data) => {
                this.dataSource.data = data;

                console.log(data);
                this.isLoaded.set(true);
                this.dataSource._updateChangeSubscription();
            },

            error: (err) => {
                console.error('Error cargando ventas', err);
                this.isLoaded.set(false);
            }
        });
    }

    getEstadoClass(estado: string): string {

        switch (estado) {

            case 'PENDIENTE':
                return `
                bg-amber-50
                text-amber-700
                ring-1 ring-amber-200/60
            `;

            case 'PAGADA':
                return `
                bg-emerald-50
                text-emerald-700
                ring-1 ring-emerald-200/60
            `;

            case 'PROCESANDO':
                return `
                bg-blue-50
                text-blue-700
                ring-1 ring-blue-200/60
            `;

            case 'COMPLETADA':
                return `
                bg-teal-50
                text-teal-700
                ring-1 ring-teal-200/60
            `;

            case 'CANCELADA':
                return `
                bg-rose-50
                text-rose-700
                ring-1 ring-rose-200/60
            `;

            case 'ANULADA':
                return `
                bg-zinc-100
                text-zinc-600
                ring-1 ring-zinc-200
            `;

            case 'REEMBOLSADA':
                return `
                bg-violet-50
                text-violet-700
                ring-1 ring-violet-200/60
            `;

            case 'DEVUELTA':
                return `
                bg-orange-50
                text-orange-700
                ring-1 ring-orange-200/60
            `;

            default:
                return `
                bg-slate-100
                text-slate-600
                ring-1 ring-slate-200
            `;
        }
    }

    getMetodoPagoClass(metodo: string): string {

        switch (metodo) {

            case 'EFECTIVO':
                return `
                bg-emerald-50
                text-emerald-700
                ring-1 ring-emerald-200/60
            `;

            case 'TARJETA_CREDITO':
                return `
                bg-sky-50
                text-sky-700
                ring-1 ring-sky-200/60
            `;

            case 'TARJETA_DEBITO':
                return `
                bg-indigo-50
                text-indigo-700
                ring-1 ring-indigo-200/60
            `;

            case 'TRANSFERENCIA_BANCARIA':
                return `
                bg-violet-50
                text-violet-700
                ring-1 ring-violet-200/60
            `;

            case 'CHEQUE':
                return `
                bg-amber-50
                text-amber-700
                ring-1 ring-amber-200/60
            `;

            case 'OTRO':
                return `
                bg-zinc-100
                text-zinc-700
                ring-1 ring-zinc-200
            `;

            default:
                return `
                bg-slate-100
                text-slate-700
                ring-1 ring-slate-200
            `;
        }
    }

    getMetodoPagoIcon(metodo: string): string {

        switch (metodo) {

            case 'EFECTIVO':
                return 'payments';

            case 'TARJETA_CREDITO':
                return 'credit_card';

            case 'TARJETA_DEBITO':
                return 'credit_score';

            case 'TRANSFERENCIA_BANCARIA':
                return 'account_balance';

            case 'CHEQUE':
                return 'receipt_long';

            case 'OTRO':
                return 'more_horiz';

            default:
                return 'wallet';
        }
    }

    getMetodoPagoLabel(metodo: string): string {

        switch (metodo) {

            case 'EFECTIVO':
                return 'Efectivo';

            case 'TARJETA_CREDITO':
                return 'Tarjeta Crédito';

            case 'TARJETA_DEBITO':
                return 'Tarjeta Débito';

            case 'TRANSFERENCIA_BANCARIA':
                return 'Transferencia';

            case 'CHEQUE':
                return 'Cheque';

            case 'OTRO':
                return 'Otro';

            default:
                return metodo;
        }
    }
}