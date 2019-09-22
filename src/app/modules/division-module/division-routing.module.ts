import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DivisionComponent } from './division.component';
import { DocumentStartComponent } from '../document-module/document-start/document-start.component';
import { DivisionEditComponent } from './division-edit/division-edit.component';

const routes: Routes = [
  {
    path: 'division',
    component: DivisionComponent,
    children: [
      { path: '', component: DocumentStartComponent },
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
