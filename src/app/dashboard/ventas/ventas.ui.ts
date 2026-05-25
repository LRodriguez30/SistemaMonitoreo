export function getEstadoClass(estado: string): string {

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

export function getEstadoIcon(estado: string): string {
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

export function getMontoMeta(estado: string): { sign: string; class: string; prefix: string } {

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