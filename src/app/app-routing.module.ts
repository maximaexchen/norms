import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentsComponent } from './documents/documents.component';
import { DocumentDetailComponent } from './documents/document-detail/document-detail.component';
import { DocumentEditComponent } from './documents/document-edit/document-edit.component';
import { DocumentsStartComponent } from './documents/documents-start/documents-start.component';
import { DocumentResolve } from './documents/document-resolve.resolver';
import { DocumentAddComponent } from './documents/document-add/document-add.component';

const routes: Routes = [
  { path: '', redirectTo: '/documents', pathMatch: 'full' },
  {
    path: 'documents',
    component: DocumentsComponent,
    children: [
      { path: '', component: DocumentsStartComponent },
      { path: 'new', component: DocumentEditComponent },
      {
        path: ':id',
        component: DocumentDetailComponent,
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: { document: DocumentResolve }
      },
      { path: ':id/edit', component: DocumentEditComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes
      /* { onSameUrlNavigation: 'reload' } , { enableTracing: true } */
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
