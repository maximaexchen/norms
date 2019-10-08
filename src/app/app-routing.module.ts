import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'document',
    pathMatch: 'full'
  },
  {
    path: 'search',
    loadChildren: './modules/search/search.module#SearchModule'
  },
  {
    path: 'publisher',
    loadChildren: './modules/publisher/publisher.module#PublisherModule'
  },
  {
    path: 'document',
    loadChildren: './modules/document/document.module#DocumentModule'
  },
  {
    path: 'tag',
    loadChildren: './modules/tag/tag.module#TagModule'
  },
  {
    path: 'group',
    loadChildren: './modules/group/group.module#GroupModule'
  },
  {
    path: 'user',
    loadChildren: './modules/user/user.module#UserModule'
  },
  {
    path: 'role',
    loadChildren: './modules/role/role.module#RoleModule'
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
