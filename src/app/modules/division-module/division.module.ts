import { NgModule } from '@angular/core';

import { DivisionRoutingModule } from './division-routing.module';
import { DivisionEditComponent } from './division-edit/division-edit.component';
import { DivisionListComponent } from './division-list/division-list.component';
import { DivisionComponent } from './division.component';
import { GeneralModule } from 'src/app/shared/modules/general.module';

@NgModule({
  declarations: [
    DivisionComponent,
    DivisionEditComponent,
    DivisionListComponent
  ],
  imports: [GeneralModule, DivisionRoutingModule, DivisionRoutingModule],
  exports: []
})
export class DivisionModule {}
