import { StartComponent } from './components/start/start.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuardService } from './modules/auth/guards/authGuard.service';

const routes: Routes = [
  {
    path: 'access-point',
    loadChildren: () =>
      import('./modules/access-point/access-point.module').then(
        m => m.AccessPointModule
      )
  },
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
    canActivate: [AuthGuardService]
  },
  { path: 'start', component: StartComponent, canActivate: [AuthGuardService] },
  {
    path: 'document',
    // loadChildren: './modules/document/document.module#DocumentModule',
    loadChildren: () =>
      import('./modules/document/document.module').then(m => m.DocumentModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'tag',
    loadChildren: () =>
      import('./modules/tag/tag.module').then(m => m.TagModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'group',
    loadChildren: () =>
      import('./modules/group/group.module').then(m => m.GroupModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./modules/user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'role',
    loadChildren: () =>
      import('./modules/role/role.module').then(m => m.RoleModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'logout',
    loadChildren: () =>
      import('./modules/auth/auth.module').then(m => m.AuthModule)
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
