import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadChildren: './modules/search/search.module#SearchModule'
  },
  {
    path: 'division',
    loadChildren: './modules/division/division.module#DivisionModule'
  },
  {
    path: 'document',
    loadChildren: './modules/document/document.module#DocumentModule'
  },
  {
    path: 'group',
    loadChildren: './modules/group/group.module#GroupModule'
  },
  {
    path: 'user',
    loadChildren: './modules/user/user.module#UserModule'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        preloadingStrategy: PreloadAllModules
      }
      /*, { enableTracing: true }, { onSameUrlNavigation: 'reload' }  */
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
