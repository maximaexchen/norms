import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuardService } from './modules/auth/guards/authGuard.service';

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
    loadChildren: './modules/document/document.module#DocumentModule',
    canActivate: [AuthGuardService]
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
  },
  {
    path: 'login',
    loadChildren: './modules/auth/auth.module#AuthModule'
  },
  {
    path: 'logout',
    loadChildren: './modules/auth/auth.module#AuthModule'
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
