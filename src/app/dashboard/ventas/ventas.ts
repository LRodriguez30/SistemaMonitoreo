import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { CreateVenta, EstadoVenta, MetodoDePago, UpdateVenta, VentaEnums, VentaFilter, VentasResponse, VentasService } from '../../services/ventas.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DynamicCreateModel } from '../../helpers/fieldConfig';
import { DataType, FilterEngine, FilterField, FilterType } from '../../helpers/FilterEngine';
import { TableSchema } from '../../helpers/TableSchema';
import { humanizeEnum } from '../../helpers/EnumFormatter';

type UpdateModalAction = 'close' | 'reset';
type VentaFilterKey = keyof VentaFilter;
type MultiFields = 'estado' | 'metodoPago';

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
    templateUrl: './ventas.html',
    styleUrl: './ventas.css'
})
export class Ventas {
    private InitializeTableSchema(): TableSchema<VentasResponse> {
        return {
            fields: [
                { key: 'rowIndex', label: '#', type: 'counter', source: 'computed' },

                { key: 'idSucursal', label: 'ID SUCURSAL', type: 'guid' },
                { key: 'fechaVenta', label: 'FECHA', type: 'date' },
                { key: 'idVenta', label: 'ID VENTA', type: 'guid' },
                { key: 'idCliente', label: 'ID CLIENTE', type: 'guid' },

                { key: 'metodoPago', label: 'MÉTODO DE PAGO', type: 'badge' },
                { key: 'total', label: 'TOTAL', type: 'currency' },
                { key: 'cantidadProductos', label: 'CANTIDAD VENDIDA', type: 'number' },

                { key: 'estado', label: 'ESTADO DE VENTA', type: 'status' },

                { key: 'creadoEn', label: 'CREADO EN', type: 'datetime' },
                { key: 'actualizadoEn', label: 'ACTUALIZADO EN', type: 'datetime' },

                { key: 'creadoPor', label: 'CREADO POR', type: 'guid' },
                { key: 'actualizadoPor', label: 'ACTUALIZADO POR', type: 'guid' },

                { key: 'actions', label: '', type: 'actions', source: 'ui' }
            ]
        };
    }

    private InitializeFilterEngine() {

        return new FilterEngine<VentaFilter>(
            [
                {
                    field: 'estado',
                    filter: {
                        styleClass: "estado-badge",
                        label: "Estado de Venta",
                        filterType: FilterType.MULTI_SELECT,
                        dataType: DataType.SELECT,
                        options: Object.values(EstadoVenta).map(value => ({
                            label: value.includes('_')
                                ? humanizeEnum({
                                    value,
                                    connectors:
                                        [{ index: 0, word: 'de' }]
                                })
                                : humanizeEnum({ value }),

                            value
                        }))
                    }
                },
                {
                    field: 'metodoPago',
                    filter: {
                        label: "Método de Pago",
                        filterType: FilterType.MULTI_SELECT,
                        dataType: DataType.SELECT,
                        options: Object.values(MetodoDePago).map(value => ({
                            label: value.includes('_')
                                ? humanizeEnum({
                                    value,
                                    connectors:
                                        [{ index: 0, word: 'de' }]
                                })
                                : humanizeEnum({ value }),

                            value
                        }))
                    }
                },

                {
                    field: 'total',
                    filter: {
                        label: "En Cantidad Monetaria alrededor de:",
                        filterType: FilterType.NUMBER_RANGE,
                        dataType: DataType.NUMBER
                    }
                },

                {
                    field: 'fechaVenta',
                    filter: {
                        label: "Entre las Fechas:",
                        filterType: FilterType.DATE_RANGE,
                        dataType: DataType.DATETIME
                    }
                },

                {
                    field: 'idSucursal',
                    filter: {
                        label: "ID Sucursal",
                        filterType: FilterType.EQUALS,
                        dataType: DataType.GUID
                    }
                },
                {
                    field: 'idVenta',
                    filter: {
                        label: "ID Venta",
                        filterType: FilterType.EQUALS,
                        dataType: DataType.GUID
                    }
                },
                {
                    field: 'idCliente',
                    filter: {
                        label: "ID Cliente",
                        filterType: FilterType.EQUALS,
                        dataType: DataType.GUID
                    }
                }
            ],
            {
                estado: [],
                metodoPago: [],
                total: { min: null, max: null },
                fechaVenta: { from: '', to: '' },
                idSucursal: '',
                idVenta: '',
                idCliente: ''
            }
        );
    }

    // =========================================================
    // STATE
    // =========================================================
    isLoaded = signal(false);
    isApiError = signal(false);

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
    deleteTarget: VentasResponse | null = null;
    updateTarget: VentasResponse | null = null;

    updateModel: DynamicCreateModel | null = null;
    createModel: DynamicCreateModel | null = null;

    formCreateState: Record<string, any> = {};
    formUpdateState: Record<string, any> = {};
    originalFormState: Record<string, any> = {};

    dataSource = new MatTableDataSource<VentasResponse>();

    // =========================================================
    // FILTER STATE
    // =========================================================
    isFilterOpen = signal(false);
    activeFilterCount = signal(0);

    filterEngine = this.InitializeFilterEngine();

    filterState = this.filterEngine.createState();
    readonly filterRules = this.filterEngine.rules;

    toggleMulti(field: VentaFilterKey, valor: string) {
        const current = this.filterState[field] as string[];
        const idx = current.indexOf(valor);

        (this.filterState[field] as string[]) = idx === -1
            ? [...current, valor]
            : current.filter(v => v !== valor);
    }

    setRangeValue(field: VentaFilterKey, key: 'min' | 'max' | 'from' | 'to', raw: string) {
        const current = { ...(this.filterState[field] as any) };

        if (key === 'min' || key === 'max') {
            current[key] = raw === '' ? null : Number(raw);
        } else {
            current[key] = raw;
        }

        this.filterState[field] = current;
    }

    asRange(value: any): { min: number | null; max: number | null } {
        return value as { min: number | null; max: number | null };
    }

    asDateRange(value: any): { from: string; to: string } {
        return value as { from: string; to: string };
    }

    getFilterValue(
        field: VentaFilterKey
    ) {
        return this.filterState[field];
    }

    setFilterValue(
        field: VentaFilterKey,
        value: any
    ) {
        this.filterState[field] = value;
    }

    openFilter() {
        this.isFilterOpen.set(true);
    }

    closeFilter() {
        this.isFilterOpen.set(false);
    }

    applyFilter() {
        const f = this.filterState;

        this.dataSource.filterPredicate = (row: VentasResponse) => {

            const totalRaw = row.total;
            const total = Number(totalRaw);

            if (f.estado.length > 0 && !f.estado.includes(row.estado)) return false;

            if (f.metodoPago.length > 0 && !f.metodoPago.includes(row.metodoPago)) return false;

            if (f.total.min !== null && row.total < f.total.min) return false;
            if (f.total.max !== null && row.total > f.total.max) return false;

            if (f.fechaVenta.from) {
                const desde = new Date(f.fechaVenta.from);
                if (new Date(row.fechaVenta) < desde) return false;
            }

            if (f.fechaVenta.to) {
                const hasta = new Date(f.fechaVenta.to);
                hasta.setHours(23, 59, 59);
                if (new Date(row.fechaVenta) > hasta) return false;
            }

            if (f.idSucursal && !row.idSucursal.toLowerCase().includes(f.idSucursal.toLowerCase())) return false;
            if (f.idVenta && !row.idVenta.toLowerCase().includes(f.idVenta.toLowerCase())) return false;
            if (f.idCliente && !row.idCliente.toLowerCase().includes(f.idCliente.toLowerCase())) return false;

            return true;
        };

        this.dataSource.filter = 'active';

        let count = 0;
        if (f.estado.length > 0) count++;
        if (f.metodoPago.length > 0) count++;
        if (f.total.min !== null || f.total.max !== null) count++;
        if (f.fechaVenta.from || f.fechaVenta.to) count++;
        if (f.idSucursal) count++;
        if (f.idCliente) count++;

        this.activeFilterCount.set(count);
        this.closeFilter();
    }

    clearFilter() {
        this.filterState = {
            estado: [],
            metodoPago: [],
            total: { min: null, max: null },
            fechaVenta: { from: '', to: '' },
            idSucursal: '',
            idVenta: '',
            idCliente: ''
        };

        this.dataSource.filter = '';
        this.activeFilterCount.set(0);
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
            row: VentasResponse,
            filter: string
        ) => {

            return this.buildSearchText(row).includes(filter);
        };
    }

    private buildSearchText(row: VentasResponse): string {
        return [
            row.idVenta,
            row.idSucursal,
            row.idCliente,
            row.estado,
            row.metodoPago,
            row.creadoPor,
            row.actualizadoPor,
            row.total
        ].join(' ').toLowerCase();
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
    ventasSchema = this.InitializeTableSchema();

    get displayedColumns(): string[] {
        return this.ventasSchema.fields
            .filter(f => f.type !== 'actions' || f.source === 'ui')
            .map(f => f.key as string);
    }

    get columnLabels(): Record<string, string> {
        return Object.fromEntries(
            this.ventasSchema.fields.map(f => [f.key, f.label])
        );
    }

    get columnConfig(): Record<string, { type: string }> {
        return Object.fromEntries(
            this.ventasSchema.fields.map(f => [
                f.key,
                { type: f.type }
            ])
        );
    }

    guidColumns = [
        'idSucursal',
        'idProducto',
        'idVenta',
        'idCliente',
        'creadoPor',
        'actualizadoPor'
    ];

    // =========================================================
    // CONSTRUCTOR / INIT
    // =========================================================
    constructor(
        private readonly ventasService: VentasService
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
        this.isApiError.set(false);

        this.ventasService.getVentas().subscribe({

            next: (data) => {
                this.dataSource.data = data;
                this.isLoaded.set(true);
                this.dataSource.data = [...data];
            },

            error: (err) => {
                console.error('Error cargando ventas', err);
                this.isApiError.set(true);
                this.isLoaded.set(false);
            }
        });
    }

    getRowIndex(row: VentasResponse): number {
        return this.dataSource.data.indexOf(row) + 1;
    }

    // =========================================================
    // CREATE FLOW
    // =========================================================
    openCreate() {

        this.createModel = {
            title: 'Nuevo registro de venta',
            endpoint: `/api/VentasSucursal`,
            fields: [
                { key: 'idSucursal', label: 'ID Sucursal', type: 'guid', required: true },
                { key: 'idCliente', label: 'ID Cliente', type: 'guid', required: true },

                {
                    key: 'metodoPago',
                    label: 'Método de pago',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'EFECTIVO', value: 'EFECTIVO' },
                        { label: 'TARJETA_CREDITO', value: 'TARJETA_CREDITO' },
                        { label: 'TARJETA_DEBITO', value: 'TARJETA_DEBITO' },
                        { label: 'TRANSFERENCIA_BANCARIA', value: 'TRANSFERENCIA_BANCARIA' },
                        { label: 'CHEQUE', value: 'CHEQUE' },
                        { label: 'OTRO', value: 'OTRO' }
                    ]
                },

                { key: 'total', label: 'Total', type: 'number', required: true },
                { key: 'cantidadProductos', label: 'Cantidad de productos', type: 'int', required: true },

                {
                    key: 'estado',
                    label: 'Estado de venta',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'PENDIENTE', value: 'PENDIENTE' },
                        { label: 'PROCESANDO', value: 'PROCESANDO' },
                        { label: 'PAGADA', value: 'PAGADA' },
                        { label: 'COMPLETADA', value: 'COMPLETADA' },
                        { label: 'CANCELADA', value: 'CANCELADA' },
                        { label: 'ANULADA', value: 'ANULADA' },
                        { label: 'REEMBOLSADA', value: 'REEMBOLSADA' },
                        { label: 'DEVUELTA', value: 'DEVUELTA' }
                    ]
                },

                { key: 'creadoPor', label: 'Creado por', type: 'guid', required: true }
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

        const payload: CreateVenta = {
            idSucursal: this.formCreateState['idSucursal'],
            idCliente: this.formCreateState['idCliente'],
            metodoPago: this.formCreateState['metodoPago'],
            total: Number(this.formCreateState['total']),
            cantidadProductos: Number(this.formCreateState['cantidadProductos']),
            estado: this.formCreateState['estado'],
            creadoPor: this.formCreateState['creadoPor']
        };

        this.ventasService.createVenta(payload).subscribe({
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
    updateVenta(row: VentasResponse) {

        this.updateTarget = row;

        this.updateModel = {
            title: 'Actualizar venta',
            endpoint: `/api/VentasSucursal`,
            fields: [
                { key: 'idSucursal', label: 'ID Sucursal', type: 'guid', required: true },
                { key: 'idVenta', label: 'ID Venta', type: 'guid', required: true },
                { key: 'idCliente', label: 'ID Cliente', type: 'text', required: true },

                {
                    key: 'metodoPago',
                    label: 'Método de pago',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'EFECTIVO', value: 'EFECTIVO' },
                        { label: 'TARJETA_CREDITO', value: 'TARJETA_CREDITO' },
                        { label: 'TARJETA_DEBITO', value: 'TARJETA_DEBITO' },
                        { label: 'TRANSFERENCIA_BANCARIA', value: 'TRANSFERENCIA_BANCARIA' },
                        { label: 'CHEQUE', value: 'CHEQUE' },
                        { label: 'OTRO', value: 'OTRO' }
                    ]
                },

                { key: 'total', label: 'Total', type: 'number', required: true },
                { key: 'cantidadProductos', label: 'Cantidad de productos', type: 'int', required: true },

                {
                    key: 'estado',
                    label: 'Estado',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'PENDIENTE', value: 'PENDIENTE' },
                        { label: 'PROCESANDO', value: 'PROCESANDO' },
                        { label: 'PAGADA', value: 'PAGADA' },
                        { label: 'COMPLETADA', value: 'COMPLETADA' },
                        { label: 'CANCELADA', value: 'CANCELADA' },
                        { label: 'ANULADA', value: 'ANULADA' },
                        { label: 'REEMBOLSADA', value: 'REEMBOLSADA' },
                        { label: 'DEVUELTA', value: 'DEVUELTA' }
                    ]
                },

                { key: 'creadoPor', label: 'Creado por', type: 'guid-text', required: true },
                { key: 'actualizadoPor', label: 'Actualizado por', type: 'guid-text', required: true }
            ]
        };

        this.formUpdateState = {
            idSucursal: row.idSucursal,
            idVenta: row.idVenta,
            idCliente: row.idCliente,
            metodoPago: row.metodoPago,
            total: row.total,
            cantidadProductos: row.cantidadProductos,
            estado: row.estado,
            creadoPor: row.creadoPor,
            actualizadoPor: row.actualizadoPor
        };

        this.originalFormState = structuredClone(this.formUpdateState);
        this.isUpdateOpen.set(true);
        this.updateFormValidity('update');
    }

    submitUpdate() {

        if (!this.updateTarget) return;

        this.isUpdating.set(true);

        const payload: UpdateVenta = {
            idCliente: this.formUpdateState['idCliente'],
            metodoPago: this.formUpdateState['metodoPago'],
            total: Number(this.formUpdateState['total']),
            cantidadProductos: Number(this.formUpdateState['cantidadProductos']),
            estado: this.formUpdateState['estado'],
            creadoPor: this.formUpdateState['creadoPor'],
            actualizadoPor: this.formUpdateState['actualizadoPor']
        };

        this.ventasService.updateVenta(
            this.updateTarget.idSucursal,
            this.updateTarget.idVenta,
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
                console.error('Error actualizando venta', err);
                this.isUpdating.set(false);
            }
        });
    }

    // =========================================================
    // DELETE FLOW
    // =========================================================
    deleteVenta(row: VentasResponse) {
        this.deleteTarget = row;
        this.isDeleteOpen.set(true);
    }

    confirmDelete() {

        if (!this.deleteTarget) return;

        this.isDeleting.set(true);

        this.ventasService.deleteVenta(
            this.deleteTarget.idSucursal,
            this.deleteTarget.idVenta
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
                console.error('Error eliminando venta', err);
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

    // =========================================================
    // EVENT TYPE MAPPING
    // =========================================================
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

    getEstadoIcon(estado: string): string {
        switch (estado) {

            case 'PENDIENTE':
                return 'schedule';

            case 'PROCESANDO':
                return 'autorenew';

            case 'PAGADA':
                return 'payments';

            case 'COMPLETADA':
                return 'check_circle';

            case 'CANCELADA':
                return 'cancel';

            case 'ANULADA':
                return 'block';

            case 'REEMBOLSADA':
                return 'keyboard_return';

            case 'DEVUELTA':
                return 'undo';

            default:
                return 'help';
        }
    }

    getMontoMeta(estado: string): { sign: string; class: string; prefix: string } {

        switch (estado) {

            case 'PAGADA':
                return {
                    sign: '+',
                    prefix: '',
                    class: 'text-emerald-600'
                };

            case 'COMPLETADA':
                return {
                    sign: '+',
                    prefix: '',
                    class: 'text-teal-600'
                };

            case 'PENDIENTE':
                return {
                    sign: '~',
                    prefix: '',
                    class: 'text-amber-500'
                };

            case 'PROCESANDO':
                return {
                    sign: '~',
                    prefix: '',
                    class: 'text-blue-600'
                };

            case 'CANCELADA':
                return {
                    sign: '-',
                    prefix: '',
                    class: 'text-rose-600'
                };

            case 'ANULADA':
                return {
                    sign: '×',
                    prefix: '',
                    class: 'text-zinc-500'
                };

            case 'REEMBOLSADA':
                return {
                    sign: '↺',
                    prefix: '',
                    class: 'text-violet-600'
                };

            case 'DEVUELTA':
                return {
                    sign: '↩',
                    prefix: '',
                    class: 'text-orange-600'
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