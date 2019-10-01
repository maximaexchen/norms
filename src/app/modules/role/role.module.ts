import { NgModule } from '@angular/core';
import { RoleComponent } from './role.component';
import { RoleEditComponent } from './role-edit/role-edit.component';
import { RoleListComponent } from './role-list/role-list.component';
import { GeneralModule } from '../general.module';
import { RoleRoutingModule } from './role-routing.module';

@NgModule({
  declarations: [RoleComponent, RoleEditComponent, RoleListComponent],
  imports: [GeneralModule, RoleRoutingModule]
})
export class RoleModule {}
