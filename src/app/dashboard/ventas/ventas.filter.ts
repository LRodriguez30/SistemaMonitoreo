import { humanizeEnum } from "../../helpers/EnumFormatter";
import { DataType, FilterEngine, FilterType } from "../../engines/FilterEngine";
import { EstadoVenta, MetodoDePago, VentaFilter } from "../../services/ventas.service";

export function InitializeFilterEngine() {

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