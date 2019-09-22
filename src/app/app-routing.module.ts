import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentSearchComponent } from './modules/document-module/document-search/document-search.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentSearchComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes
      /*, { enableTracing: true }, { onSameUrlNavigation: 'reload' }  */
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
