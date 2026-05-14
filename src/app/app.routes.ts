import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Ventas } from './dashboard/ventas/ventas';
import { Inventario } from './dashboard/inventario/inventario';
import { Logs } from './dashboard/logs/logs';
import { Auditorias } from './dashboard/auditorias/auditorias';
import { Sesiones } from './dashboard/sesiones/sesiones';
import { Metricas } from './dashboard/metricas/metricas';
import { Sistema } from './dashboard/sistema/sistema';
import { Cajas } from './dashboard/cajas/cajas';

export const routes: Routes = [
    {
        path: '',
        title: 'Dashboard | Monitoreo',
        component: Dashboard,
        children: [
            {
                path: 'ventas',
                title: 'Ventas | Monitoreo',
                component: Ventas
            },
            {
                path: 'inventario',
                title: 'Inventario | Monitoreo',
                component: Inventario
            },
            {
                path: 'logs',
                title: 'Logs de Actividad | Monitoreo',
                component: Logs
            },
            {
                path: 'auditorias',
                title: 'Auditorías | Monitoreo',
                component: Auditorias
            },
            {
                path: 'sesiones',
                title: 'Sesiones | Monitoreo',
                component: Sesiones
            },
            {
                path: 'metricas',
                title: 'Métricas | Monitoreo',
                component: Metricas
            },
            {
                path: 'sistema',
                title: 'Sistema | Monitoreo',
                component: Sistema
            },
            {
                path: 'cajas',
                title: 'Cajas | Monitoreo',
                component: Cajas
            }
        ]
    }
];
