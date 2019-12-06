import { NgModule } from '@angular/core';

import { DialogModule } from 'primeng/dialog';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

import { GeneralModule } from 'src/app/modules/general.module';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { AuthModule } from '../auth/auth.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    GeneralModule,
    SearchRoutingModule,
    DialogModule,
    AngularMultiSelectModule,
    AuthModule
  ],
  exports: [SearchComponent]
})
export class SearchModule {}
