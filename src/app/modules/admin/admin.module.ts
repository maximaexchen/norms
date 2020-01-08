import { AdminComponent } from './admin.component';
import { AuthModule } from './../auth/auth.module';
import { UserModule } from './../user/user.module';
import { NgModule } from '@angular/core';

import { GroupModule } from '../group/group.module';

import { GeneralModule } from 'src/app/modules/general.module';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [AdminComponent],
  imports: [
    GeneralModule,
    AdminRoutingModule,
    GroupModule,
    UserModule,
    AuthModule
  ],
  exports: []
})
export class AdminModule {}
