import { DocumentComponent } from './document.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentEditComponent } from './document-edit/document-edit.component';
import { DocumentListComponent } from './document-list/document-list.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentComponent,
    children: [
      { path: 'new', component: DocumentEditComponent },
      { path: 'list', component: DocumentListComponent },
      { path: ':id/edit', component: DocumentEditComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentRoutingModule {}
