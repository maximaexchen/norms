import { NgModule } from '@angular/core';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';

import { AuthRoutingModule } from './auth-routing.modules';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from '@app/modules/auth/logout/logout.component';
import { AuthComponent } from '@app/modules/auth/auth.component';

import { GeneralModule } from 'src/app/modules/general.module';
import { IsGrantedDirective } from '@app/modules/auth/directives/isGranted.directive';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { AuthenticationService } from './services/authentication.service';
import { AuthGuardService } from './guards/authGuard.service';
import { AuthInterceptor } from './auth.interceptor';
import { AuthErrorHandler } from './AuthError.handler';

@NgModule({
  declarations: [
    AuthComponent,
    LogoutComponent,
    LoginComponent,
    IsGrantedDirective
  ],
  imports: [
    GeneralModule,
    AuthRoutingModule,
    ProgressSpinnerModule,
    ToastModule,
    FieldsetModule,
    DialogModule
  ],
  exports: [LoginComponent, LogoutComponent, IsGrantedDirective]
})
export class AuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [
        AuthenticationService,
        AuthGuardService,
        AuthErrorHandler,
        AuthInterceptor
      ]
    };
  }
}
