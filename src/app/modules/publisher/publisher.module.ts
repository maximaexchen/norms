import { NgModule } from '@angular/core';

import { GeneralModule } from 'src/app/modules/general.module';
import { PublisherRoutingModule } from './publisher-routing.module';
import { PublisherComponent } from './publisher.component';
import { PublisherEditComponent } from './publisher-edit/publisher-edit.component';
import { PublisherListComponent } from './publisher-list/publisher-list.component';

@NgModule({
  declarations: [
    PublisherComponent,
    PublisherEditComponent,
    PublisherListComponent
  ],
  imports: [GeneralModule, PublisherRoutingModule]
})
export class PublisherModule {}
