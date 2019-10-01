import { UserRoutingModule } from './user-routing.module';
import { NgModule } from '@angular/core';

import { GeneralModule } from 'src/app/modules/general.module';
import { UserComponent } from './user.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UserListComponent } from './user-list/user-list.component';

@NgModule({
  declarations: [UserComponent, UserEditComponent, UserListComponent],
  imports: [GeneralModule, UserRoutingModule],
  exports: []
})
export class UserModule {}
