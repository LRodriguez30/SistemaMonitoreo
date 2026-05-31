export type EstadoVenta =
    | 'PENDIENTE'
    | 'PROCESANDO'
    | 'PAGADA'
    | 'COMPLETADA'
    | 'CANCELADA'
    | 'ANULADA'
    | 'REEMBOLSADA'
    | 'DEVUELTA';

export type EstadoModo =
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'muted';

/* =========================================================
   MODO CENTRAL
========================================================= */

export function getEstadoModo(estado: string): EstadoModo {

    switch (estado) {

        case 'PAGADA':
        case 'COMPLETADA':
            return 'success';

        case 'PENDIENTE':
            return 'warning';

        case 'PROCESANDO':
            return 'info';

        case 'CANCELADA':
        case 'ANULADA':
            return 'danger';

        case 'REEMBOLSADA':
        case 'DEVUELTA':
            return 'muted';

        default:
            return 'neutral';
    }
}

/* =========================================================
   CLASES UI (ESTADO)
========================================================= */

export function getEstadoClass(estado: string): string {

    const modo = getEstadoModo(estado);

    switch (modo) {

        case 'success':
            return `
                bg-emerald-50
                text-emerald-700
                ring-1 ring-emerald-200/60
            `;

        case 'warning':
            return `
                bg-amber-50
                text-amber-700
                ring-1 ring-amber-200/60
            `;

        case 'info':
            return `
                bg-blue-50
                text-blue-700
                ring-1 ring-blue-200/60
            `;

        case 'danger':
            return `
                bg-rose-50
                text-rose-700
                ring-1 ring-rose-200/60
            `;

        case 'muted':
            return `
                bg-zinc-100
                text-zinc-600
                ring-1 ring-zinc-200
            `;

        default:
            return `
                bg-slate-100
                text-slate-600
                ring-1 ring-slate-200
            `;
    }
}

/* =========================================================
   ICONOS (ESTADO)
========================================================= */

export function getEstadoIcon(estado: string): string {

    const modo = getEstadoModo(estado);

    switch (modo) {

        case 'success':
            return 'check_circle';

        case 'warning':
            return 'schedule';

        case 'info':
            return 'autorenew';

        case 'danger':
            return 'cancel';

        case 'muted':
            return 'undo';

        default:
            return 'help';
    }
}

/* =========================================================
   MÉTODO DE PAGO - CLASES
========================================================= */

export function getMetodoPagoClass(metodo: string): string {

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

/* =========================================================
   MÉTODO DE PAGO - ICONOS
========================================================= */

export function getMetodoPagoIcon(metodo: string): string {

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

/* =========================================================
   MÉTODO DE PAGO - LABELS
========================================================= */

export function getMetodoPagoLabel(metodo: string): string {

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

/* =========================================================
   MONTO META (VISUAL)
========================================================= */

export function getMontoMeta(estado: string): { sign: string; class: string; prefix: string } {

    const modo = getEstadoModo(estado);

    switch (modo) {

        case 'success':
            return { sign: '+', prefix: '', class: 'text-emerald-600' };

        case 'warning':
            return { sign: '~', prefix: '', class: 'text-amber-500' };

        case 'info':
            return { sign: '~', prefix: '', class: 'text-blue-600' };

        case 'danger':
            return { sign: '-', prefix: '', class: 'text-rose-600' };

        case 'muted':
            return { sign: '×', prefix: '', class: 'text-zinc-500' };

        default:
            return { sign: '?', prefix: '', class: 'text-slate-500' };
    }
}