import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DivisionComponent } from './division.component';
import { DivisionEditComponent } from './division-edit/division-edit.component';
import { DivisionListComponent } from './division-list/division-list.component';

const routes: Routes = [
  {
    path: '',
    component: DivisionComponent,
    children: [
      { path: 'list', component: DivisionListComponent },
      { path: 'new', component: DivisionEditComponent },
      { path: ':id/edit', component: DivisionEditComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DivisionRoutingModule {}
