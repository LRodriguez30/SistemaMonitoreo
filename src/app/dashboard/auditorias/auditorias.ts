import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuditoriasResponse, AuditoriasService } from '../../services/auditorias.service';

@Component({
    selector: 'app-auditorias',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './auditorias.html'
})
export class Auditorias {

    isLoaded = signal(false);

    // =========================
    // COLUMNAS (CORREGIDO)
    // =========================
    displayedColumns: string[] = [
        'fechaAuditoria',
        'idAuditoria',
        'idUsuario',
        'entidad',
        'accion',
        'datosAnteriores',
        'datosNuevos',
        'actions'
    ];

    columnLabels: Record<string, string> = {
        fechaAuditoria: 'FECHA AUDITORÍA',
        idAuditoria: 'ID AUDITORÍA',
        idUsuario: 'ID USUARIO',
        entidad: 'ENTIDAD',
        accion: 'ACCIÓN',
        datosAnteriores: 'ANTES',
        datosNuevos: 'DESPUÉS',
        actions: 'ACCIONES'
    };

    columnConfig: Record<string, { type: string }> = {
        fechaAuditoria: { type: 'datetime' },
        idAuditoria: { type: 'id' },
        idUsuario: { type: 'user' },
        entidad: { type: 'badge' },
        accion: { type: 'status' },
        datosAnteriores: { type: 'text' },
        datosNuevos: { type: 'text' },
        actions: { type: 'actions' }
    };

    dataSource = new MatTableDataSource<AuditoriasResponse>();

    constructor(
        private readonly auditoriasService: AuditoriasService
    ) {
        this.loadData();
    }

    // =========================
    // DATA
    // =========================

    loadData() {

        this.isLoaded.set(false);

        this.auditoriasService.getAuditorias().subscribe({

            next: (data) => {
                this.dataSource.data = data;
                this.isLoaded.set(true);
                this.dataSource._updateChangeSubscription();
            },

            error: (err) => {
                console.error('Error cargando auditorías', err);
                this.isLoaded.set(false);
            }
        });
    }

    // =========================
    // ACTIONS UI
    // =========================

    updateAuditoria(row: AuditoriasResponse) {
        console.log('Ver detalle', row);
    }

    deleteAuditoria(row: AuditoriasResponse) {
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
    // ACCIONES
    // =========================

    getAccionClass(accion: string): string {

        switch (this.normalize(accion)) {

            case 'INICIO_SESION':
                return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60';

            case 'CIERRE_SESION':
                return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200';

            case 'CAMBIAR_CONTRASENA':
                return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60';

            case 'ACTUALIZAR_PRODUCTO':
                return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60';

            case 'EXPORTAR_PDF':
                return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60';

            case 'CREAR_FACTURA':
                return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60';

            default:
                return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
        }
    }

    getAccionIcon(accion: string): string {

        switch (this.normalize(accion)) {

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

        switch (this.normalize(accion)) {

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

    // =========================
    // ENTIDADES
    // =========================

    getEntidadClass(entidad: string): string {

        switch (this.normalize(entidad)) {

            case 'USUARIOS':
                return 'bg-blue-700/90 text-blue-50';

            case 'INVENTARIO':
                return 'bg-amber-700/90 text-amber-50';

            case 'VENTAS':
                return 'bg-violet-700/90 text-violet-50';

            case 'REPORTES':
                return 'bg-rose-700/90 text-rose-50';

            case 'AUTENTICACION':
                return 'bg-emerald-700/90 text-emerald-50';

            default:
                return 'bg-slate-700/90 text-slate-50';
        }
    }

    getEntidadIcon(entidad: string): string {

        switch (this.normalize(entidad)) {

            case 'USUARIOS':
                return 'group';

            case 'INVENTARIO':
                return 'inventory_2';

            case 'VENTAS':
                return 'shopping_cart';

            case 'REPORTES':
                return 'analytics';

            case 'AUTENTICACION':
                return 'shield';

            default:
                return 'category';
        }
    }

    getEntidadLabel(entidad: string): string {

        switch (this.normalize(entidad)) {

            case 'USUARIOS':
                return 'Usuarios';

            case 'INVENTARIO':
                return 'Inventario';

            case 'VENTAS':
                return 'Ventas';

            case 'REPORTES':
                return 'Reportes';

            case 'AUTENTICACION':
                return 'Autenticación';

            default:
                return entidad;
        }
    }
}