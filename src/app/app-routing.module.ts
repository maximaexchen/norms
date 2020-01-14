import { StartComponent } from './components/start/start.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuardService } from './modules/auth/guards/authGuard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
    canActivate: [AuthGuardService]
  },
  { path: 'start', component: StartComponent, canActivate: [AuthGuardService] },
  {
    path: 'document',
    loadChildren: './modules/document/document.module#DocumentModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'tag',
    loadChildren: './modules/tag/tag.module#TagModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'group',
    loadChildren: './modules/group/group.module#GroupModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'user',
    loadChildren: './modules/user/user.module#UserModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'role',
    loadChildren: './modules/role/role.module#RoleModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'admin',
    loadChildren: './modules/admin/admin.module#AdminModule',
    canActivate: [AuthGuardService]
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
