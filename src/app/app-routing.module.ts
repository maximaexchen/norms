import { DocumentListComponent } from './document/document-list/document-list.component';
import { DocumentSearchComponent } from './document/document-search/document-search.component';
import { DivisionComponent } from './division/division.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentComponent } from './document/document.component';
import { DocumentDetailComponent } from './document/document-detail/document-detail.component';
import { DocumentEditComponent } from './document/document-edit/document-edit.component';
import { DocumentStartComponent } from './document/document-start/document-start.component';
import { GroupComponent } from './group/group.component';
import { GroupEditComponent } from './group/group-edit/group-edit.component';
import { APIResolver } from './shared/resolver/api.resolver';
import { UserEditComponent } from './user/user-edit/user-edit.component';
import { UserComponent } from './user/user.component';
import { DivisionEditComponent } from './division/division-edit/division-edit.component';
import { DocumentResolver } from './shared/resolver/document.resolver';

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
      {
        path: ':id',
        component: DocumentDetailComponent,
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: { document: APIResolver }
      },
      { path: ':id/edit', component: DocumentEditComponent }
    ]
  },
  {
    path: 'group',
    component: GroupComponent,
    children: [
      { path: '', component: DocumentStartComponent },
      { path: 'new', component: GroupEditComponent },
      {
        path: ':id',
        component: DocumentDetailComponent,
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: { group: APIResolver }
      },
      { path: ':id/edit', component: GroupEditComponent }
    ]
  },
  {
    path: 'user',
    component: UserComponent,
    children: [
      { path: '', component: DocumentStartComponent },
      { path: 'new', component: UserEditComponent },
      {
        path: ':id',
        component: DocumentDetailComponent,
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        resolve: { user: APIResolver }
      },
      { path: ':id/edit', component: UserEditComponent }
    ]
  },
  {
    path: 'division',
    component: DivisionComponent,
    children: [
      { path: '', component: DocumentStartComponent },
      { path: 'new', component: DivisionEditComponent },
      {
        path: ':id',
        component: DocumentDetailComponent
      },
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
