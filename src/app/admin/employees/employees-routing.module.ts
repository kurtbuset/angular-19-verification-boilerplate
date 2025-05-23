import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component'
import { WorkflowsListComponent } from './workflows-list.component'


const routes: Routes = [
    { path: '', component: ListComponent },
    { path: 'workflows', component: WorkflowsListComponent},
    { path: 'add', component: AddEditComponent },
    { path: 'edit/:id', component: AddEditComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeesRoutingModule { }