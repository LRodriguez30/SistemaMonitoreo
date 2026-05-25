import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioResponse, InventarioService, CreateInventario } from '../../services/inventario.service';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DynamicCreateModel } from '../../helpers/ActionsHelper';

type UpdateModalAction = 'close' | 'reset';

interface InventarioFilter {
    tipoEvento: string[];
    cantidadMin: number | null;
    cantidadMax: number | null;
    fechaDesde: string;
    fechaHasta: string;
    idProducto: string;
    idSucursal: string;
    idUsuario: string;
}

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
    templateUrl: './inventario.html',
    styleUrl: './inventario.css'
})
export class Inventario {

    // =========================================================
    // STATE
    // =========================================================
    isLoaded = signal(false);

    isClosing = signal(false);
    isDeleting = signal(false);

    isDeleteOpen = signal(false);
    isDeleteClosing = signal(false);

    isUpdateOpen = signal(false);
    isUpdateClosing = signal(false);
    isUpdating = signal(false);

    isDirty = signal(false);
    isFormValid = signal(false);

    isDiscardWarningOpen = signal(false);

    isCreateOpen = signal(false);
    isSubmitting = signal(false);

    hideGuidColumns = signal(true);

    // =========================================================
    // DATA MODELS
    // =========================================================
    deleteTarget: InventarioResponse | null = null;
    updateTarget: InventarioResponse | null = null;

    updateModel: DynamicCreateModel | null = null;
    createModel: DynamicCreateModel | null = null;

    formCreateState: Record<string, any> = {};
    formUpdateState: Record<string, any> = {};
    originalFormState: Record<string, any> = {};

    dataSource = new MatTableDataSource<InventarioResponse>();

    // =========================================================
    // FILTER STATE
    // =========================================================
    isFilterOpen = signal(false);
    activeFilterCount = signal(0);

    filterState: InventarioFilter = {
        tipoEvento: [],
        cantidadMin: null,
        cantidadMax: null,
        fechaDesde: '',
        fechaHasta: '',
        idProducto: '',
        idSucursal: '',
        idUsuario: ''
    };

    tipoEventoOptions = ['ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION', 'TRANSFERENCIA'];

    openFilter() {
        this.isFilterOpen.set(true);
    }

    closeFilter() {
        this.isFilterOpen.set(false);
    }

    toggleTipoEvento(tipo: string) {
        const idx = this.filterState.tipoEvento.indexOf(tipo);
        this.filterState.tipoEvento = idx === -1
            ? [...this.filterState.tipoEvento, tipo]
            : this.filterState.tipoEvento.filter(t => t !== tipo);
    }

    applyFilter() {
        const f = this.filterState;

        this.dataSource.filterPredicate = (row: InventarioResponse) => {

            if (f.tipoEvento.length > 0 && !f.tipoEvento.includes(row.tipoEvento)) return false;

            if (f.cantidadMin !== null && row.cantidad < f.cantidadMin) return false;
            if (f.cantidadMax !== null && row.cantidad > f.cantidadMax) return false;

            if (f.fechaDesde) {
                const desde = new Date(f.fechaDesde);
                if (new Date(row.fechaEvento) < desde) return false;
            }

            if (f.fechaHasta) {
                const hasta = new Date(f.fechaHasta);
                hasta.setHours(23, 59, 59);

                if (new Date(row.fechaEvento) > hasta) return false;
            }

            if (f.idSucursal && !row.idSucursal.toLowerCase().includes(f.idSucursal.toLowerCase())) return false;

            if (f.idUsuario && !row.idUsuario.toLowerCase().includes(f.idUsuario.toLowerCase())) return false;

            return true;
        };

        this.dataSource.filter = 'active';

        let count = 0;
        if (f.tipoEvento.length > 0) count++;
        if (f.cantidadMin !== null || f.cantidadMax !== null) count++;
        if (f.fechaDesde || f.fechaHasta) count++;
        if (f.idSucursal) count++;
        if (f.idUsuario) count++;

        this.activeFilterCount.set(count);
        this.closeFilter();
    }

    clearFilter() {

        this.filterState = {
            tipoEvento: [],
            cantidadMin: null,
            cantidadMax: null,
            fechaDesde: '',
            fechaHasta: '',
            idProducto: '',
            idSucursal: '',
            idUsuario: ''
        };

        this.dataSource.filter = '';
        this.activeFilterCount.set(0);
        this.closeFilter();
    }

    applyGlobalFilter(event: Event) {

        const value =
            (event.target as HTMLInputElement)
                .value
                .trim()
                .toLowerCase();

        this.dataSource.filter = value;
    }

    private globalFilterPredicate() {

        return (
            row: InventarioResponse,
            filter: string
        ) => {

            const searchableText = `
                ${row.idProducto}
                ${row.fechaEvento}
                ${row.idEvento}
                ${row.idSucursal}
                ${row.tipoEvento}
                ${row.cantidad}
                ${row.idUsuario}
                ${row.observacion ?? ''}
            `
                .toLowerCase();

            return searchableText.includes(filter);
        };
    }

    get visibleColumns(): string[] {

        if (!this.hideGuidColumns()) {
            return this.displayedColumns;
        }

        return this.displayedColumns.filter(
            col => !this.guidColumns.includes(col)
        );
    }

    // =========================================================
    // TABLE CONFIG
    // =========================================================
    guidColumns = [
        'idProducto',
        'idEvento',
        'idSucursal',
        'idUsuario'
    ];

    displayedColumns: string[] = [
        'rowIndex',
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
        rowIndex: 'No.',
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
        cantidad: { type: 'int' },
        idUsuario: { type: 'user' },
        observacion: { type: 'text' },
        actions: { type: 'actions' }
    };

    // =========================================================
    // CONSTRUCTOR / INIT
    // =========================================================
    constructor(
        private readonly inventarioService: InventarioService
    ) {
        this.dataSource.filterPredicate =
            this.globalFilterPredicate();
        this.loadData();
    }

    // =========================================================
    // DATA LOADING
    // =========================================================
    loadData() {

        this.isLoaded.set(false);

        this.inventarioService
            .getEventoInventario()
            .subscribe({

                next: (data) => {
                    this.dataSource.data = data;
                    this.isLoaded.set(true);
                    this.dataSource.data = [...data];
                },

                error: (err) => {
                    console.error('Error cargando inventario', err);
                    this.isLoaded.set(false);
                }
            });
    }

    getRowIndex(row: InventarioResponse): number {
        return this.dataSource.data.indexOf(row) + 1;
    }

    // =========================================================
    // CREATE FLOW
    // =========================================================
    openCreate() {

        this.createModel = {
            title: 'Nuevo evento de inventario',
            endpoint: `/api/EventosInventario`,
            fields: [
                { key: 'idProducto', label: 'ID Producto', type: 'guid', required: true },
                { key: 'idSucursal', label: 'ID Sucursal', type: 'guid', required: true },

                {
                    key: 'tipoEvento',
                    label: 'Tipo de evento',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'ENTRADA', value: 'ENTRADA' },
                        { label: 'SALIDA', value: 'SALIDA' },
                        { label: 'AJUSTE', value: 'AJUSTE' },
                        { label: 'DEVOLUCION', value: 'DEVOLUCION' },
                        { label: 'TRANSFERENCIA', value: 'TRANSFERENCIA' }
                    ]
                },

                { key: 'cantidad', label: 'Cantidad', type: 'int', required: true },
                { key: 'idUsuario', label: 'ID Usuario', type: 'guid', required: true },
                { key: 'observacion', label: 'Observación', type: 'text', required: false }
            ]
        };

        this.formCreateState = this.createModel.fields.reduce((acc, field) => {

            switch (field.type) {

                case 'int':
                    acc[field.key] = Math.floor(Math.random() * 100) + 1;
                    break;

                case 'select':
                    const options = field.options ?? [];

                    acc[field.key] =
                        options.length > 0
                            ? options[Math.floor(Math.random() * options.length)].value
                            : '';

                    break;

                case 'guid':
                    acc[field.key] = this.generateGuid();
                    break;

                default:
                    acc[field.key] = '';
            }

            return acc;

        }, {} as Record<string, any>);

        this.isCreateOpen.set(true);
        this.updateFormValidity('create');
    }

    submitCreate() {

        this.isSubmitting.set(true);

        const payload: CreateInventario = {
            idProducto: this.formCreateState['idProducto'],
            idSucursal: this.formCreateState['idSucursal'],
            tipoEvento: this.formCreateState['tipoEvento'],
            cantidad: Number(this.formCreateState['cantidad']),
            idUsuario: this.formCreateState['idUsuario'],
            observacion: this.formCreateState['observacion'] ?? null
        };

        this.inventarioService.createInventario(payload).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.isClosing.set(true);

                setTimeout(() => {
                    this.isCreateOpen.set(false);
                    this.isClosing.set(false);
                    this.formCreateState = {};
                    this.loadData();
                }, 200);
            },

            error: () => {
                this.isSubmitting.set(false);
            }
        });
    }

    // =========================================================
    // UPDATE FLOW
    // =========================================================
    updateEventoInventario(row: InventarioResponse) {

        this.updateTarget = row;

        this.updateModel = {
            title: 'Actualizar evento inventario',
            endpoint: `/api/EventosInventario`,
            fields: [
                { key: 'idProducto', label: 'ID Producto', type: 'guid', required: true },
                { key: 'idEvento', label: 'ID Evento', type: 'guid', required: true },

                {
                    key: 'tipoEvento',
                    label: 'Tipo evento',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'ENTRADA', value: 'ENTRADA' },
                        { label: 'SALIDA', value: 'SALIDA' },
                        { label: 'AJUSTE', value: 'AJUSTE' },
                        { label: 'DEVOLUCION', value: 'DEVOLUCION' },
                        { label: 'TRANSFERENCIA', value: 'TRANSFERENCIA' }
                    ]
                },

                { key: 'cantidad', label: 'Cantidad', type: 'int', required: true },
                { key: 'idUsuario', label: 'ID Usuario', type: 'guid-text', required: true },
                { key: 'observacion', label: 'Observación', type: 'text', required: false }
            ]
        };

        this.formUpdateState = {
            idProducto: row.idProducto,
            idEvento: row.idEvento,
            tipoEvento: row.tipoEvento,
            cantidad: row.cantidad,
            idUsuario: row.idUsuario,
            observacion: row.observacion ?? ''
        };

        this.originalFormState = structuredClone(this.formUpdateState);
        this.isUpdateOpen.set(true);
        this.updateFormValidity('update');
    }

    submitUpdate() {

        if (!this.updateTarget) return;

        this.isUpdating.set(true);

        const payload = {
            tipoEvento: this.formUpdateState['tipoEvento'],
            cantidad: Number(this.formUpdateState['cantidad']),
            idUsuario: this.formUpdateState['idUsuario'],
            observacion: this.formUpdateState['observacion']
        };

        this.inventarioService.updateInventario(
            this.updateTarget.idProducto,
            this.updateTarget.idEvento,
            this.updateTarget.idSucursal,
            payload
        ).subscribe({

            next: () => {
                this.isUpdateClosing.set(true);

                setTimeout(() => {
                    this.isUpdateOpen.set(false);
                    this.isUpdateClosing.set(false);
                    this.isUpdating.set(false);
                    this.updateTarget = null;
                    this.loadData();
                }, 200);
            },

            error: (err) => {
                console.error('Error actualizando inventario', err);
                this.isUpdating.set(false);
            }
        });
    }

    // =========================================================
    // DELETE FLOW
    // =========================================================
    deleteEventoInventario(row: InventarioResponse) {
        this.deleteTarget = row;
        this.isDeleteOpen.set(true);
    }

    confirmDelete() {

        if (!this.deleteTarget) return;

        this.isDeleting.set(true);

        this.inventarioService.deleteInventario(
            this.deleteTarget.idProducto,
            this.deleteTarget.idEvento,
            this.deleteTarget.idSucursal
        ).subscribe({

            next: () => {

                this.isDeleteClosing.set(true);

                setTimeout(() => {
                    this.isDeleteOpen.set(false);
                    this.isDeleteClosing.set(false);
                    this.isDeleting.set(false);
                    this.deleteTarget = null;
                    this.loadData();
                }, 200);
            },

            error: (err) => {
                console.error('Error eliminando inventario', err);
                this.isDeleting.set(false);
            }
        });
    }

    closeDeleteModal() {
        this.isDeleteClosing.set(true);

        setTimeout(() => {
            this.isDeleteOpen.set(false);
            this.isDeleteClosing.set(false);
            this.deleteTarget = null;
        }, 200);
    }

    // =========================================================
    // FORM CONTROL
    // =========================================================
    setFieldValue(key: string, value: any, action: 'create' | 'update') {
        if (action === 'create') {
            this.formCreateState[key] = value;
        } else {
            this.formUpdateState[key] = value;
        }
        this.isDirty.set(true);
        this.updateDirtyState();
        this.updateFormValidity(action);
    }

    onNumberChange(key: string, event: Event, action: 'create' | 'update') {
        const value = (event.target as HTMLInputElement).value;
        const state = action === 'create' ? this.formCreateState : this.formUpdateState;

        if (value === '') {
            state[key] = '';
            this.updateFormValidity(action);
            return;
        }

        const parsed = Number(value);
        state[key] = isNaN(parsed) ? 0 : parsed;

        this.updateFormValidity(action);
    }

    closeModal() {
        this.isClosing.set(true);
        this.isFormValid.set(false);

        setTimeout(() => {
            this.isCreateOpen.set(false);
            this.isClosing.set(false);
            this.isDirty.set(false);
        }, 200);
    }

    // =========================================================
    // VALIDATION
    // =========================================================
    private updateFormValidity(action: 'create' | 'update') {

        const model = action === 'create' ? this.createModel : this.updateModel;
        const state = action === 'create' ? this.formCreateState : this.formUpdateState;

        if (!model) {
            this.isFormValid.set(false);
            return;
        }


        for (const field of model.fields) {
            const value = state[field.key];

            const isEmpty =
                value === null ||
                value === undefined ||
                value === '';

            if (field.required && isEmpty) {
                this.isFormValid.set(false);
                return;
            }

            if (!field.required && isEmpty) {
                continue;
            }

            if (field.type === 'guid' || field.type === 'guid-text') {
                if (!this.isValidGuid(value)) {
                    this.isFormValid.set(false);
                    return;
                }
            }

            if (field.type === 'number' || field.type === 'int') {

                const num = Number(value);

                if (!Number.isFinite(num) || num <= 0) {
                    this.isFormValid.set(false);
                    return;
                }
            }
        }

        this.isFormValid.set(true);
    }

    private isValidGuid(value: any): boolean {
        if (typeof value !== 'string') return false;

        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
            .test(value.trim());
    }

    // =========================================================
    // UPDATE CONTROL HELPERS
    // =========================================================
    hasChanges(): boolean {
        return JSON.stringify(this.formUpdateState) !== JSON.stringify(this.originalFormState);
    }

    discardChanges() {
        this.isDiscardWarningOpen.set(false);
        this.forceCloseUpdate();
    }

    closeUpdateModal(action: UpdateModalAction = 'close') {

        if (action === 'reset') {
            this.formUpdateState = structuredClone(this.originalFormState);
            return;
        }

        if (this.hasChanges()) {
            this.isDiscardWarningOpen.set(true);
            return;
        }

        this.forceCloseUpdate();
    }

    forceCloseUpdate() {
        this.isUpdateOpen.set(false);
        this.updateModel = null;
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private updateDirtyState() {
        this.isDirty.set(
            JSON.stringify(this.formUpdateState) !== JSON.stringify(this.originalFormState)
        );
    }

    private generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    // =========================================================
    // EVENT TYPE MAPPING
    // =========================================================
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

    getTipoEventoIcon(tipo: string): string {

        switch (tipo) {

            case 'ENTRADA':
                return 'south_west';

            case 'SALIDA':
                return 'north_east';

            case 'AJUSTE':
                return 'tune';

            case 'DEVOLUCION':
                return 'undo';

            case 'TRANSFERENCIA':
                return 'swap_horiz';

            default:
                return 'help';
        }
    }

    getTipoEventoLabel(tipo: string): string {

        switch (tipo) {

            case 'ENTRADA':
                return 'Entrada';

            case 'SALIDA':
                return 'Salida';

            case 'AJUSTE':
                return 'Ajuste';

            case 'DEVOLUCION':
                return 'Devolución';

            case 'TRANSFERENCIA':
                return 'Transferencia';

            default:
                return tipo;
        }
    }

    getCantidadMeta(tipo: string): { sign: string; class: string; prefix: string } {

        switch (tipo) {

            case 'ENTRADA':
                return {
                    sign: '+',
                    prefix: '',
                    class: 'text-emerald-600'
                };

            case 'SALIDA':
                return {
                    sign: '-',
                    prefix: '',
                    class: 'text-rose-600'
                };

            case 'AJUSTE':
                return {
                    sign: '±',
                    prefix: '',
                    class: 'text-amber-600'
                };

            case 'DEVOLUCION':
                return {
                    sign: '↩',
                    prefix: '',
                    class: 'text-sky-600'
                };

            case 'TRANSFERENCIA':
                return {
                    sign: '⇄',
                    prefix: '',
                    class: 'text-violet-600'
                };

            default:
                return {
                    sign: '?',
                    prefix: '',
                    class: 'text-slate-500'
                };
        }
    }
}