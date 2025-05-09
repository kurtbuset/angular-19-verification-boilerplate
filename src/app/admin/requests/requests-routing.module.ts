import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list.component';
import { UpdateComponent } from './update.component'

const routes: Routes = [
    { path: '', component: ListComponent },
    { path: 'update', component: UpdateComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RequestsRoutingModule { }