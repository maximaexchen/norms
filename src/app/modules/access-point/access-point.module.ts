import { AuthModule } from './../auth/auth.module';
import { SearchModule } from './../search/search.module';
import { UserModule } from './../user/user.module';
import { NgModule } from '@angular/core';

import { AccessPointComponent } from './access-point.component';
import { AccessPointRoutingModule } from './access-point-routing.module';
import { GroupModule } from '../group/group.module';

import { GeneralModule } from 'src/app/modules/general.module';

@NgModule({
  declarations: [AccessPointComponent],
  imports: [
    GeneralModule,
    AccessPointRoutingModule,
    GroupModule,
    UserModule,
    SearchModule,
    AuthModule
  ],
  exports: []
})
export class AccessPointModule {}
