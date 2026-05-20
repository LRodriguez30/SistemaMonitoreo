import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CajasResponse, CajasService, CreateCaja } from '../../services/cajas.service';
import { DynamicCreateModel } from '../../helpers/fieldConfig';
import { FilterEngine } from '../../helpers/FilterEngine';

type UpdateModalAction = 'close' | 'reset';

interface CajaFilter {
    tipoEvento: string[];
    montoMin: number | null;
    montoMax: number | null;
    fechaDesde: string;
    fechaHasta: string;
    idUsuario: string;
}



@Component({
    selector: 'app-cajas',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './cajas.html',
    styleUrl: './cajas.css'
})
export class Cajas {

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
    // DATA
    // =========================================================
    deleteTarget: CajasResponse | null = null;
    updateTarget: CajasResponse | null = null;

    updateModel: DynamicCreateModel | null = null;
    createModel: DynamicCreateModel | null = null;

    formCreateState: Record<string, any> = {};
    formUpdateState: Record<string, any> = {};
    originalFormState: Record<string, any> = {};

    dataSource = new MatTableDataSource<CajasResponse>();

    // =========================================================
    // FILTER STATE
    // =========================================================
    isFilterOpen = signal(false);

    activeFilterCount = signal(0);

    filterState: CajaFilter = {
        tipoEvento: [],
        montoMin: null,
        montoMax: null,
        fechaDesde: '',
        fechaHasta: '',
        idUsuario: ''
    };

    tipoEventoOptions = ['APERTURA', 'CIERRE', 'RETIRO', 'INGRESO', 'CORTE'];

    openFilter() {
        this.isFilterOpen.set(true);
    }

    closeFilter() {
        this.isFilterOpen.set(false);
    }

    toggleTipoEvento(tipo: string) {
        const idx = this.filterState.tipoEvento.indexOf(tipo);

        if (idx === -1) {
            this.filterState.tipoEvento = [...this.filterState.tipoEvento, tipo];
        } else {
            this.filterState.tipoEvento = this.filterState.tipoEvento.filter(t => t !== tipo);
        }
    }

    applyFilter() {
        const f = this.filterState;

        this.dataSource.filterPredicate = (row: CajasResponse) => {

            if (f.tipoEvento.length > 0 && !f.tipoEvento.includes(row.tipoEvento)) {
                return false;
            }

            if (f.montoMin !== null && row.monto < f.montoMin) return false;
            if (f.montoMax !== null && row.monto > f.montoMax) return false;

            if (f.fechaDesde) {
                const desde = new Date(f.fechaDesde);
                const fecha = new Date(row.fechaEvento);
                if (fecha < desde) return false;
            }

            if (f.fechaHasta) {
                const hasta = new Date(f.fechaHasta);
                hasta.setHours(23, 59, 59);
                const fecha = new Date(row.fechaEvento);
                if (fecha > hasta) return false;
            }

            if (f.idUsuario && !row.idUsuario.toLowerCase().includes(f.idUsuario.toLowerCase())) {
                return false;
            }

            return true;
        };

        // Cualquier string no vacío activa el filterPredicate
        this.dataSource.filter = 'active';

        // Contar filtros activos para el badge
        let count = 0;
        if (f.tipoEvento.length > 0) count++;
        if (f.montoMin !== null || f.montoMax !== null) count++;
        if (f.fechaDesde || f.fechaHasta) count++;
        if (f.idUsuario) count++;

        this.activeFilterCount.set(count);
        this.closeFilter();
    }

    clearFilter() {
        this.filterState = {
            tipoEvento: [],
            montoMin: null,
            montoMax: null,
            fechaDesde: '',
            fechaHasta: '',
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
            row: CajasResponse,
            filter: string
        ) => {

            const searchableText = `
            ${row.idCaja}
            ${row.idEvento}
            ${row.idUsuario}
            ${row.tipoEvento}
            ${row.descripcion}
            ${row.monto}
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
        'idCaja',
        'idEvento',
        'idUsuario'
    ];

    displayedColumns: string[] = [
        'rowIndex',
        'idCaja',
        'fechaEvento',
        'idEvento',
        'idUsuario',
        'tipoEvento',
        'monto',
        'descripcion',
        'actions'
    ];

    columnLabels: Record<string, string> = {
        rowIndex: 'No.',
        idCaja: 'ID CAJA',
        fechaEvento: 'FECHA EVENTO',
        idEvento: 'ID EVENTO',
        idUsuario: 'ID USUARIO',
        tipoEvento: 'TIPO EVENTO',
        monto: 'MONTO',
        descripcion: 'DESCRIPCIÓN',
        actions: 'ACCIONES'
    };

    columnConfig: Record<string, { type: string }> = {
        idCaja: { type: 'id' },
        fechaEvento: { type: 'datetime' },
        idEvento: { type: 'id' },
        idUsuario: { type: 'user' },
        tipoEvento: { type: 'badge' },
        monto: { type: 'currency' },
        descripcion: { type: 'text' },
        actions: { type: 'actions' }
    };

    // =========================================================
    // CONSTRUCTOR / INIT
    // =========================================================
    constructor(
        private readonly cajasService: CajasService
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

        this.cajasService.getCajas().subscribe({

            next: (data) => {
                this.dataSource.data = data;
                this.isLoaded.set(true);
                this.dataSource._updateChangeSubscription();
            },

            error: (err) => {
                console.error('Error cargando cajas', err);
                this.isLoaded.set(false);
            }
        });
    }

    getRowIndex(row: CajasResponse): number {
        return this.dataSource.data.indexOf(row) + 1;
    }

    // =========================================================
    // CREATE FLOW
    // =========================================================
    openCreate() {

        this.createModel = {
            title: 'Nuevo registro de caja',
            endpoint: `/api/Cajas`,
            fields: [
                { key: 'idCaja', label: 'ID Caja', type: 'guid', required: true },
                { key: 'idUsuario', label: 'ID Usuario', type: 'guid', required: true },
                {
                    key: 'tipoEvento',
                    label: 'Tipo de evento',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'APERTURA', value: 'APERTURA' },
                        { label: 'CIERRE', value: 'CIERRE' },
                        { label: 'RETIRO', value: 'RETIRO' },
                        { label: 'INGRESO', value: 'INGRESO' },
                        { label: 'CORTE', value: 'CORTE' }
                    ]
                },
                { key: 'monto', label: 'Monto', type: 'number', required: true },
                { key: 'descripcion', label: 'Descripción', type: 'text', required: false }
            ]
        };

        // init defaults
        this.formCreateState = this.createModel.fields.reduce((acc, field) => {

            switch (field.type) {

                case 'number':
                    acc[field.key] = +(Math.random() * (1500 - 200) + 200).toFixed(2);
                    break;

                case 'int':
                    acc[field.key] = Math.floor(Math.random() * (75 - 3 + 1)) + 3;
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

        const payload: CreateCaja = {
            idCaja: this.formCreateState['idCaja'],
            idUsuario: this.formCreateState['idUsuario'],
            tipoEvento: this.formCreateState['tipoEvento'],
            monto: Number(this.formCreateState['monto']),
            descripcion: this.formCreateState['descripcion'] ?? null
        };

        this.cajasService.createCaja(payload).subscribe({
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
    // UPDATE
    // =========================================================
    updateCaja(row: CajasResponse) {

        this.updateTarget = row;

        this.updateModel = {
            title: 'Actualizar registro de caja',
            endpoint: `/api/Cajas`,
            fields: [
                { key: 'idCaja', label: 'ID Caja', type: 'guid', required: true },
                { key: 'idEvento', label: 'ID Evento', type: 'guid', required: true },
                {
                    key: 'tipoEvento',
                    label: 'Tipo de evento',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'APERTURA', value: 'APERTURA' },
                        { label: 'CIERRE', value: 'CIERRE' },
                        { label: 'RETIRO', value: 'RETIRO' },
                        { label: 'INGRESO', value: 'INGRESO' },
                        { label: 'CORTE', value: 'CORTE' }
                    ]
                },
                { key: 'monto', label: 'Monto', type: 'number', required: true },
                { key: 'descripcion', label: 'Descripción', type: 'text', required: false }
            ]
        };

        this.formUpdateState = {
            idCaja: row.idCaja,
            idEvento: row.idEvento,
            idUsuario: row.idUsuario,
            tipoEvento: row.tipoEvento,
            monto: row.monto,
            descripcion: row.descripcion ?? ''
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
            monto: Number(this.formUpdateState['monto']),
            descripcion: this.formUpdateState['descripcion']
        };

        this.cajasService.updateCaja(
            this.updateTarget.idCaja,
            this.updateTarget.idEvento,
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
                console.error('Error actualizando caja', err);
                this.isUpdating.set(false);
            }
        });
    }

    // =========================================================
    // DELETE
    // =========================================================
    deleteCaja(row: CajasResponse) {
        this.deleteTarget = row;
        this.isDeleteOpen.set(true);
    }

    confirmDelete() {

        if (!this.deleteTarget) return;

        this.isDeleting.set(true);

        this.cajasService.deleteCaja(
            this.deleteTarget.idCaja,
            this.deleteTarget.idEvento
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
                console.error('Error eliminando', err);
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

        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
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

    private normalize(value: string): string {
        return (value ?? '')
            .toUpperCase()
            .replace(/\s+/g, '_')
            .trim();
    }

    private isEmpty(value: any): boolean {
        return value === null || value === undefined || String(value).trim() === '';
    }

    // =========================================================
    // EVENT TYPE MAPPING
    // =========================================================
    getEventoClass(tipo: string): string { /* unchanged */
        switch (this.normalize(tipo)) {
            case 'APERTURA': return 'bg-emerald-700/90 text-emerald-50';
            case 'CIERRE': return 'bg-zinc-700/90 text-zinc-50';
            case 'RETIRO': return 'bg-rose-700/90 text-rose-50';
            case 'INGRESO': return 'bg-blue-700/90 text-blue-50';
            case 'CORTE': return 'bg-amber-700/90 text-amber-50';
            default: return 'bg-slate-700/90 text-slate-50';
        }
    }

    getEventoIcon(tipo: string): string { /* unchanged */
        switch (this.normalize(tipo)) {
            case 'APERTURA': return 'lock_open';
            case 'CIERRE': return 'lock';
            case 'RETIRO': return 'remove_circle';
            case 'INGRESO': return 'add_circle';
            case 'CORTE': return 'content_cut';
            default: return 'help';
        }
    }

    getEventoLabel(tipo: string): string { /* unchanged */
        switch (this.normalize(tipo)) {
            case 'APERTURA': return 'Apertura';
            case 'CIERRE': return 'Cierre';
            case 'RETIRO': return 'Retiro';
            case 'INGRESO': return 'Ingreso';
            case 'CORTE': return 'Corte';
            default: return tipo;
        }
    }

    getEventoTextClass(tipo: string): string { /* unchanged */
        switch (this.normalize(tipo)) {
            case 'APERTURA': return 'text-emerald-600';
            case 'CIERRE': return 'text-zinc-700';
            case 'RETIRO': return 'text-red-600';
            case 'INGRESO': return 'text-blue-600';
            case 'CORTE': return 'text-amber-600';
            default: return 'text-gray-600';
        }
    }

    getEventoMontoPrefix(tipo: string): string { /* unchanged */
        switch (this.normalize(tipo)) {
            case 'INGRESO':
            case 'APERTURA': return '+';
            case 'RETIRO': return '-';
            case 'CORTE': return '±';
            default: return '';
        }
    }
}