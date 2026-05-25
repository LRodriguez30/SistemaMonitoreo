import { TableSchema } from "../../helpers/TableConfig";
import { VentasResponse } from "../../services/ventas.service";

export function InitializeTableSchema(): TableSchema<VentasResponse> {
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

export const GUID_COLUMNS: string[] = [
    'idSucursal',
    'idProducto',
    'idVenta',
    'idCliente',
    'creadoPor',
    'actualizadoPor'
];