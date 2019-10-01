import { NgModule } from '@angular/core';

import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

import { GeneralModule } from 'src/app/modules/general.module';
import { GroupComponent } from './group.component';
import { GroupEditComponent } from './group-edit/group-edit.component';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupRoutingModule } from './group-routing.module';

@NgModule({
  declarations: [GroupComponent, GroupEditComponent, GroupListComponent],
  imports: [GeneralModule, GroupRoutingModule, AngularMultiSelectModule],
  exports: []
})
export class GroupModule {}
