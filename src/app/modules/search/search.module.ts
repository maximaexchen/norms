import { NgModule } from '@angular/core';

import { DialogModule } from 'primeng/dialog';

import { GeneralModule } from 'src/app/shared/modules/general.module';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';

@NgModule({
  declarations: [SearchComponent],
  imports: [GeneralModule, SearchRoutingModule, DialogModule],
  exports: [SearchComponent]
})
export class SearchModule {}
