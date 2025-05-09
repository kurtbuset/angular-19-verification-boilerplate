import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RequestsRoutingModule } from './requests-routing.module';
import { ListComponent } from './list.component';
import { UpdateComponent } from './update.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RequestsRoutingModule
    ],
    declarations: [
        ListComponent,
        UpdateComponent
    ]
})
export class RequestsModule { }

