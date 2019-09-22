import { NgModule } from '@angular/core';

import { GeneralModule } from 'src/app/shared/modules/general.module';
import { DivisionRoutingModule } from './division-routing.module';
import { DivisionComponent } from './division.component';
import { DivisionEditComponent } from './division-edit/division-edit.component';
import { DivisionListComponent } from './division-list/division-list.component';

@NgModule({
  declarations: [
    DivisionComponent,
    DivisionEditComponent,
    DivisionListComponent
  ],
  imports: [GeneralModule, DivisionRoutingModule]
})
export class DivisionModule {}
