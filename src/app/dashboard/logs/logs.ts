import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
    LogsResponse,
    LogsService
} from '../../services/logs.service';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './logs.html'
})
export class Logs {

    isLoaded = signal(false);

    displayedColumns: string[] = [
        'fechaLog',
        'idLog',
        'idUsuario',
        'modulo',
        'accion',
        'iP',
        'dispositivo',
        'descripcion',
        'actions'
    ];

    columnLabels: Record<string, string> = {
        fechaLog: 'FECHA LOG',
        idLog: 'ID LOG',
        idUsuario: 'ID USUARIO',
        modulo: 'MÓDULO',
        accion: 'ACCIÓN',
        iP: 'IP',
        dispositivo: 'DISPOSITIVO',
        descripcion: 'DESCRIPCIÓN',
        actions: 'ACCIONES'
    };

    columnConfig: Record<string, { type: string }> = {
        fechaLog: { type: 'datetime' },
        idLog: { type: 'id' },
        idUsuario: { type: 'user' },
        modulo: { type: 'badge' },
        accion: { type: 'status' },
        iP: { type: 'text' },
        dispositivo: { type: 'text' },
        descripcion: { type: 'text' },
        actions: { type: 'actions' }
    };

    dataSource = new MatTableDataSource<LogsResponse>();

    constructor(
        private readonly logsService: LogsService
    ) {
        this.loadData();
    }

    updateLogActividad(row: LogsResponse) {
        console.log('Actualizar', row);
    }

    deleteLogActividad(row: LogsResponse) {
        console.log('Eliminar', row);
    }

    loadData() {

        this.isLoaded.set(false);

        this.logsService.getLogsActividad().subscribe({

            next: (data) => {

                this.dataSource.data = data;

                console.log(data);

                this.isLoaded.set(true);

                this.dataSource._updateChangeSubscription();
            },

            error: (err) => {

                console.error('Error cargando logs', err);

                this.isLoaded.set(false);
            }
        });
    }

    getAccionClass(accion: string): string {

        switch (accion?.toUpperCase()) {

            case 'INICIO SESIÓN':
            case 'INICIO_SESION':
                return `
                bg-emerald-50
                text-emerald-700
                ring-1 ring-emerald-200/60
            `;

            case 'CIERRE_SESION':
                return `
                bg-zinc-100
                text-zinc-700
                ring-1 ring-zinc-200
            `;

            case 'CAMBIAR_CONTRASENA':
                return `
                bg-amber-50
                text-amber-700
                ring-1 ring-amber-200/60
            `;

            case 'ACTUALIZAR_PRODUCTO':
                return `
                bg-blue-50
                text-blue-700
                ring-1 ring-blue-200/60
            `;

            case 'EXPORTAR_PDF':
                return `
                bg-rose-50
                text-rose-700
                ring-1 ring-rose-200/60
            `;

            case 'CREAR_FACTURA':
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

    getAccionIcon(accion: string): string {

        switch (accion?.toUpperCase()) {

            case 'INICIO SESIÓN':
            case 'INICIO_SESION':
                return 'login';

            case 'CIERRE_SESION':
                return 'logout';

            case 'CAMBIAR_CONTRASENA':
                return 'lock_reset';

            case 'ACTUALIZAR_PRODUCTO':
                return 'inventory_2';

            case 'EXPORTAR_PDF':
                return 'picture_as_pdf';

            case 'CREAR_FACTURA':
                return 'receipt_long';

            default:
                return 'info';
        }
    }

    getAccionLabel(accion: string): string {

        switch (accion?.toUpperCase()) {

            case 'INICIO_SESION':
                return 'Inicio Sesión';

            case 'CIERRE_SESION':
                return 'Cierre Sesión';

            case 'CAMBIAR_CONTRASENA':
                return 'Cambiar Contraseña';

            case 'ACTUALIZAR_PRODUCTO':
                return 'Actualizar Producto';

            case 'EXPORTAR_PDF':
                return 'Exportar PDF';

            case 'CREAR_FACTURA':
                return 'Crear Factura';

            default:
                return accion;
        }
    }


    getModuloClass(modulo: string): string {

        switch (modulo?.toUpperCase()) {

            case 'AUTENTICACION':
                return 'bg-emerald-700/90 text-emerald-50';

            case 'USUARIOS':
                return 'bg-blue-700/90 text-blue-50';

            case 'INVENTARIO':
                return 'bg-amber-700/90 text-amber-50';

            case 'VENTAS':
                return 'bg-violet-700/90 text-violet-50';

            case 'REPORTES':
                return 'bg-rose-700/90 text-rose-50';

            default:
                return 'bg-slate-700/90 text-slate-50';
        }
    }

    getModuloIcon(modulo: string): string {

        switch (modulo?.toUpperCase()) {

            case 'AUTENTICACION':
                return 'shield';

            case 'USUARIOS':
                return 'group';

            case 'INVENTARIO':
                return 'inventory_2';

            case 'VENTAS':
                return 'shopping_cart';

            case 'REPORTES':
                return 'analytics';

            default:
                return 'dashboard';
        }
    }

    getModuloLabel(modulo: string): string {

        switch (modulo?.toUpperCase()) {

            case 'AUTENTICACION':
                return 'Autenticación';

            case 'USUARIOS':
                return 'Usuarios';

            case 'INVENTARIO':
                return 'Inventario';

            case 'VENTAS':
                return 'Ventas';

            case 'REPORTES':
                return 'Reportes';

            default:
                return modulo;
        }
    }
}