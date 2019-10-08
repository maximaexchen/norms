import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PublisherComponent } from './publisher.component';
import { PublisherEditComponent } from './publisher-edit/publisher-edit.component';
import { PublisherListComponent } from './publisher-list/publisher-list.component';

const routes: Routes = [
  {
    path: '',
    component: PublisherComponent,
    children: [
      { path: '', component: PublisherEditComponent },
      { path: 'list', component: PublisherListComponent },
      { path: 'new', component: PublisherEditComponent },
      { path: ':id/edit', component: PublisherEditComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublisherRoutingModule {}
