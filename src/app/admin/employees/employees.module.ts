import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeesRoutingModule } from './employees-routing.module';
import { ListComponent } from './list.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        EmployeesRoutingModule
    ],
    declarations: [
        ListComponent
    ]
})
export class EmployeesModule { }

