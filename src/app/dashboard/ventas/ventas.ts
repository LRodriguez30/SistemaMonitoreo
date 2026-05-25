import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { CreateVenta, UpdateVenta, VentaFilter, VentasResponse, VentasService } from '../../services/ventas.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DynamicCreateModel } from '../../helpers/ActionsHelper';

import { InitializeTableSchema, GUID_COLUMNS } from './ventas.schema';
import { InitializeFilterEngine } from './ventas.filter';

import {
    getMetodoPagoClass, getMetodoPagoIcon, getMetodoPagoLabel,
    getEstadoClass, getEstadoIcon,
    getMontoMeta
} from './ventas.ui';
import { InitializeDefaultValues } from '../../helpers/FormInit';
import { isValidGuid } from '../../helpers/Validators';

type UpdateModalAction = 'close' | 'reset';

type VentaFilterKey = keyof VentaFilter;

type CreateMode = 'menu' | 'single' | 'multi' | 'import';

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


    uploadedCsvFiles = signal<{
        file: File;
        rowCount: number;
        uploadedAt: Date;
    }[]>([]);

    csvError = signal<string | null>(null);
    csvWarning = signal<string | null>(null);

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onFileDrop(event: DragEvent) {

        event.preventDefault();
        this.csvWarning.set('');

        const file = event.dataTransfer?.files?.[0];

        if (!file) return;

        this.csvError.set(null);
        this.multiRows.set([]);

        this.preprocessCsvFile(file);
    }

    onFileSelected(event: Event) {

        const input = event.target as HTMLInputElement;
        this.csvWarning.set('');

        if (!input.files?.length) return;

        const file = input.files[0];

        this.csvError.set(null);
        this.multiRows.set([]);

        this.preprocessCsvFile(file);
        input.value = '';
    }

    preprocessCsvFile(file: File) {

        this.csvError.set(null);

        if (!file.name.toLowerCase().endsWith('.csv')) {

            this.csvError.set(
                'El archivo debe ser formato CSV'
            );

            return;
        }

        const reader = new FileReader();

        reader.onload = () => {

            try {

                const text = String(reader.result);

                const lines = text
                    .split(/\r?\n/)
                    .filter(l => l.trim().length > 0);

                const rowCount = Math.max(lines.length - 1, 0);

                if (lines.length < 2) {

                    this.csvError.set(
                        'El archivo no contiene registros'
                    );

                    return;
                }

                const headers = lines[0]
                    .split(',')
                    .map(h => h.trim());

                const requiredColumns = [
                    'idSucursal',
                    'idCliente',
                    'metodoPago',
                    'total',
                    'cantidadProductos',
                    'estado',
                    'creadoPor'
                ];

                const missing = requiredColumns.filter(
                    col => !headers.includes(col)
                );

                if (missing.length > 0) {

                    this.csvError.set(
                        `Faltan columnas: ${missing.join(', ')}`
                    );

                    return;
                }

                if (!this.isSameCsv(file)) {
                    this.uploadedCsvFiles.update(files => [
                        {
                            file,
                            uploadedAt: new Date(),
                            rowCount
                        },
                        ...files
                    ]);
                }
                else {
                    this.csvWarning.set(
                        'El archivo CSV ya fue cargado anteriormente'
                    );

                    return;
                }

            } catch {

                this.csvError.set(
                    'No se pudo analizar el archivo CSV'
                );
            }
        };

        reader.readAsText(file);
    }


    processCsvFile(file: File) {

        this.csvError.set(null);
        this.csvWarning.set(null);

        if (!file.name.toLowerCase().endsWith('.csv')) {

            this.csvError.set(
                'El archivo debe ser formato CSV'
            );

            return;
        }

        const reader = new FileReader();

        reader.onload = () => {

            try {

                const text = String(reader.result);

                const lines = text
                    .split(/\r?\n/)
                    .filter(l => l.trim().length > 0);


                if (lines.length < 2) {

                    this.csvError.set(
                        'El archivo no contiene registros'
                    );

                    return;
                }

                const headers = lines[0]
                    .split(',')
                    .map(h => h.trim());

                const requiredColumns = [
                    'idSucursal',
                    'idCliente',
                    'metodoPago',
                    'total',
                    'cantidadProductos',
                    'estado',
                    'creadoPor'
                ];

                const missing = requiredColumns.filter(
                    col => !headers.includes(col)
                );

                if (missing.length > 0) {

                    this.csvError.set(
                        `Faltan columnas: ${missing.join(', ')}`
                    );

                    return;
                }

                const rows: Record<string, any>[] = [];

                for (let i = 1; i < lines.length; i++) {

                    const values = lines[i]
                        .split(',')
                        .map(v => v.trim());

                    const row: Record<string, any> = {};

                    headers.forEach((header, index) => {
                        row[header] = values[index] ?? '';
                    });

                    row["total"] = Number(row["total"]);
                    row["cantidadProductos"] = Number(row["cantidadProductos"]);

                    rows.push(row);
                }

                this.multiRows.set(rows);

                this.createState.set({
                    open: true,
                    mode: 'multi'
                });

            } catch {

                this.csvError.set(
                    'No se pudo procesar el archivo CSV'
                );
            }
        };

        reader.readAsText(file);
    }

    downloadCsvTemplate() {

        const headers = [
            'idSucursal',
            'idCliente',
            'metodoPago',
            'total',
            'cantidadProductos',
            'estado',
            'creadoPor'
        ];

        const example = [
            '550e8400-e29b-41d4-a716-446655440000',
            '550e8400-e29b-41d4-a716-446655440001',
            'EFECTIVO',
            '150.50',
            '3',
            'PAGADA',
            '550e8400-e29b-41d4-a716-446655440002'
        ];

        const csvContent = [
            headers.join(','),
            example.join(',')
        ].join('\n');

        const blob = new Blob(
            [csvContent],
            { type: 'text/csv;charset=utf-8;' }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;
        link.download = 'plantilla_ventas.csv';

        link.click();

        URL.revokeObjectURL(url);
    }

    removeUploadedCsv(index: number) {

        const current = this.uploadedCsvFiles();

        current.splice(index, 1);

        this.uploadedCsvFiles.set([...current]);
    }

    handleCsvLoad(input: HTMLInputElement) {

        if (this.uploadedCsvFiles().length > 0) {

            this.createState.set({
                open: true,
                mode: 'import'
            });

            return;
        }

        this.createState.set({
            open: true,
            mode: 'import'
        })
    }

    isSameCsv(file: File): boolean {

        return this.uploadedCsvFiles().some(csv =>
            csv.file.name === file.name &&
            csv.file.size === file.size &&
            csv.file.lastModified === file.lastModified
        );
    }

    // =========================================================
    // STATE
    // =========================================================
    createMode = signal<CreateMode>('menu');

    isCreateModeOpen = signal(false);

    createState = signal<{
        open: boolean;
        mode: CreateMode;
    }>({
        open: false,
        mode: 'menu'
    });

    multiRows = signal<any[]>([]);

    isLoaded = signal(false);
    isApiError = signal(false);

    isOpening = signal(false);
    isClosing = signal(false);
    isDeleting = signal(false);

    isOpeningDialog = signal(false);
    isClosingDialog = signal(false);

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
    createModel: DynamicCreateModel = {
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
    } as DynamicCreateModel;;

    formCreateState: Record<string, any> = {};
    formUpdateState: Record<string, any> = {};
    originalFormState: Record<string, any> = {};

    dataSource = new MatTableDataSource<VentasResponse>();

    // =========================================================
    // FILTER STATE
    // =========================================================
    filterEngine = InitializeFilterEngine();

    isFilterOpen = signal(false);
    activeFilterCount = signal(0);

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
        this.isOpening.set(true);

        setTimeout(() => {
            this.isOpening.set(false);
        }, 16)
    }

    closeFilter() {
        this.closeModal("filter");
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
    ventasSchema = InitializeTableSchema();

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

    guidColumns = GUID_COLUMNS;


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

    createRandomRow(): Record<string, any> {
        return InitializeDefaultValues(this.createModel);
    }

    addRow() {
        const current = this.multiRows();
        this.multiRows.set([
            ...current,
            this.createRandomRow()
        ]);
    }

    removeRow(index: number) {
        const current = this.multiRows();
        current.splice(index, 1);

        this.multiRows.set([...current]);
    }

    clearAllRows() {
        this.multiRows.set([]);
    }

    updateCell(rowIndex: number, key: string, value: any) {
        const rows = this.multiRows();

        rows[rowIndex] = {
            ...rows[rowIndex],
            [key]: value
        };

        this.multiRows.set([...rows]);
    }

    submitMultiCreate() {

        const payload: CreateVenta[] = this.multiRows().map(r => ({
            idSucursal: r.idSucursal,
            idCliente: r.idCliente,
            metodoPago: r.metodoPago,
            total: Number(r.total),
            cantidadProductos: Number(r.cantidadProductos),
            estado: r.estado,
            creadoPor: r.creadoPor
        }));

        this.isSubmitting.set(true);

        this.ventasService.createVentas(payload).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                this.isClosing.set(true);

                setTimeout(() => {
                    this.createState.set({
                        open: false,
                        mode: "multi"
                    });
                    this.multiRows.set([]);
                    this.isClosing.set(false);
                    this.loadData();
                }, 200);
            },
            error: () => {
                this.isSubmitting.set(false);
            }
        });
    }


    openCreateMenu() {
        this.createMode.set('menu');
        this.isCreateModeOpen.set(true);
    }

    openCreate(mode: CreateMode = "single") {
        this.isCreateModeOpen.set(false);

        // ACC: Objeto en construcción, FIELD: Propiedad actual
        this.formCreateState = InitializeDefaultValues(this.createModel);

        setTimeout(() => {
            if (mode === 'multi') this.multiRows.set([]);

            this.createState.set({
                open: true,
                mode
            });

            this.isCreateOpen.set(true);
            this.updateFormValidity('create');
            this.isOpening.set(true);

            setTimeout(() => {
                this.isOpening.set(false);
            }, 16);
        }, 60);
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
                    this.createState.set({
                        open: false,
                        mode: 'menu'
                    });
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

        this.isOpening.set(true);

        setTimeout(() => {
            this.isOpening.set(false);
        }, 16);
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

        this.isOpening.set(true);

        setTimeout(() => {
            this.isOpening.set(false);
        }, 16);
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
        this.closeModal("delete");
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

    closeModal(action: string = "create", mode: string = "single") {
        this.isClosing.set(true);

        if (action != "delete") {
            this.isFormValid.set(false);
        }

        setTimeout(() => {
            if (action === "menu") this.isCreateModeOpen.set(false);
            if (action === "create") this.createState.set({
                open: false,
                mode: mode as CreateMode
            });
            if (action === "update") this.isUpdateOpen.set(false);
            if (action === "delete") this.isDeleteOpen.set(false);
            if (action === "filter") this.isFilterOpen.set(false);

            this.isClosing.set(false);

            if (action != "delete") this.isDirty.set(false);
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
                if (!isValidGuid(value)) {
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

    // =========================================================
    // UPDATE CONTROL HELPERS
    // =========================================================
    hasChanges(): boolean {
        return JSON.stringify(this.formUpdateState) !== JSON.stringify(this.originalFormState);
    }

    discardChanges() {
        this.closeDiscardWarning();
        this.forceCloseUpdate();
    }

    closeDiscardWarning() {
        this.isClosingDialog.set(true);
        setTimeout(() => {
            this.isClosingDialog.set(false);
            this.isDiscardWarningOpen.set(false);
        }, 200);
    }

    closeUpdateModal(action: UpdateModalAction = 'close') {

        if (action === 'reset') {
            this.formUpdateState = structuredClone(this.originalFormState);
            return;
        }

        if (this.hasChanges()) {
            this.isDiscardWarningOpen.set(true);
            this.isOpeningDialog.set(true);

            setTimeout(() => {
                this.isOpeningDialog.set(false);
            }, 16);
            return;
        }

        this.forceCloseUpdate();
    }

    forceCloseUpdate() {
        this.closeModal("update");
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private updateDirtyState() {
        this.isDirty.set(
            JSON.stringify(this.formUpdateState) !== JSON.stringify(this.originalFormState)
        );
    }


    // =========================================================
    // EVENT TYPE MAPPING
    // =========================================================
    getMetodoPagoClass = getMetodoPagoClass;
    getMetodoPagoIcon = getMetodoPagoIcon;
    getMetodoPagoLabel = getMetodoPagoLabel;
    getEstadoClass = getEstadoClass;
    getEstadoIcon = getEstadoIcon;
    getMontoMeta = getMontoMeta;
}