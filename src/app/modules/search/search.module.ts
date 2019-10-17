import { NgModule } from '@angular/core';

import { DialogModule } from 'primeng/dialog';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

import { GeneralModule } from 'src/app/modules/general.module';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    GeneralModule,
    SearchRoutingModule,
    DialogModule,
    AngularMultiSelectModule
  ],
  exports: [SearchComponent]
})
export class SearchModule {}
