import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentComponent } from './document.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { DocumentListComponent } from './document-list/document-list.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentComponent,
    children: [
      { path: '', component: DocumentEditComponent },
      { path: 'list', component: DocumentListComponent },
      { path: 'new', component: DocumentEditComponent },
      { path: ':id/edit', component: DocumentEditComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentRoutingModule {}
