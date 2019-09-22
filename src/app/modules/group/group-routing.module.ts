import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupComponent } from './group.component';
import { GroupEditComponent } from './group-edit/group-edit.component';

const routes: Routes = [
  {
    path: 'group',
    component: GroupComponent,
    children: [
      { path: '', component: GroupComponent },
      { path: 'new', component: GroupEditComponent },
      { path: ':id/edit', component: GroupEditComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule {}
