import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TagComponent } from './tag.component';
import { TagEditComponent } from './tag-edit/tag-edit.component';
import { TagListComponent } from './tag-list/tag-list.component';

const routes: Routes = [
  {
    path: '',
    component: TagComponent,
    children: [
      { path: '', component: TagEditComponent },
      { path: 'list', component: TagListComponent },
      { path: 'new', component: TagEditComponent },
      { path: ':id/edit', component: TagEditComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagRoutingModule {}
