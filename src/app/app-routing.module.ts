import { DocumentListComponent } from './modules/document-module/document-list/document-list.component';
import { DocumentSearchComponent } from './modules/document-module/document-search/document-search.component';
import { DivisionComponent } from './modules/division-module/division.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentComponent } from './modules/document-module/document.component';
import { DocumentEditComponent } from './modules/document-module/document-edit/document-edit.component';
import { DocumentStartComponent } from './modules/document-module/document-start/document-start.component';
import { GroupComponent } from './modules/group/group.component';
import { GroupEditComponent } from './modules/group/group-edit/group-edit.component';
import { UserEditComponent } from './modules/user/user-edit/user-edit.component';
import { UserComponent } from './modules/user/user.component';
import { DivisionEditComponent } from './modules/division-module/division-edit/division-edit.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentSearchComponent,
    pathMatch: 'full'
  },
  {
    path: 'document',
    component: DocumentComponent,
    /* resolve: { document: DocumentResolver }, */
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list'
      },
      { path: 'new', component: DocumentEditComponent },
      { path: 'list', component: DocumentListComponent },
      { path: ':id/edit', component: DocumentEditComponent }
    ]
  },
  {
    path: 'group',
    component: GroupComponent,
    children: [
      { path: '', component: DocumentStartComponent },
      { path: 'new', component: GroupEditComponent },
      { path: ':id/edit', component: GroupEditComponent }
    ]
  },
  {
    path: 'user',
    component: UserComponent,
    children: [
      { path: '', component: DocumentStartComponent },
      { path: 'new', component: UserEditComponent },
      { path: ':id/edit', component: UserEditComponent }
    ]
  },
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
  imports: [
    RouterModule.forRoot(
      routes
      /*, { enableTracing: true }, { onSameUrlNavigation: 'reload' }  */
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
