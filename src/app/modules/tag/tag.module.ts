import { NgModule } from '@angular/core';

import { GeneralModule } from '../general.module';

import { RadioButtonModule } from 'primeng/radiobutton';

import { TagComponent } from './tag.component';
import { TagRoutingModule } from './tag-routing.module';
import { TagListComponent } from './tag-list/tag-list.component';
import { TagEditComponent } from './tag-edit/tag-edit.component';

@NgModule({
  declarations: [TagComponent, TagListComponent, TagEditComponent],
  imports: [GeneralModule, TagRoutingModule, RadioButtonModule]
})
export class TagModule {}
