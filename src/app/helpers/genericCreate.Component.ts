import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicCreateModel, FieldConfig } from './fieldConfig';

import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-generic-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './genericCreate.component.html'
})
export class GenericCreateComponent {

    form: FormGroup;
    public fields: FieldConfig[] = [];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<GenericCreateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DynamicCreateModel
    ) {

        // 👇 IMPORTANTE: asignar fields desde data
        this.fields = data.fields;

const group: any = {};

this.fields.forEach(f => {

    // 👇 si es GUID, lo generas automático
    this.fields.forEach(f => {
        group[f.key] = this.generateExampleValue(f);
    });

    group[f.key] = f.required
        ? ['', Validators.required]
        : [''];
});
        this.form = this.fb.group(group);
    }

    submit() {
        if (this.form.invalid) return;
        this.dialogRef.close(this.form.value);
    }

    close() {
        this.dialogRef.close(null);
    }

    private generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    private generateExampleValue(field: FieldConfig): any {

    switch (field.type) {

        case 'guid':
            return this.generateGuid();

        case 'number':
            return 1200;

        case 'select':
            return field.options?.[0]?.value ?? '';

        case 'text':
            return 'Entrada a Caja';

        case 'date':
            return new Date().toISOString().split('T')[0];

        case 'datetime':
            return new Date().toISOString();

        default:
            return '';
    }
}
}