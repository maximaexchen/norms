import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  OnDestroy
} from '@angular/core';
import { AuthenticationService } from '@modules/auth/services/authentication.service';
import { SubSink } from 'SubSink';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  @Output() loginEvent = new EventEmitter();
  subsink = new SubSink();
  display = true;
  headerMsg = '';
  userName = '';
  passWord = '';

  constructor(
    private authService: AuthenticationService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {}

  public login() {
    this.subsink.sink = this.authService
      .login(this.userName, this.passWord)
      .subscribe(
        result => {
          this.display = !result;

          if (!result) {
            this.headerMsg = 'Zugangsdaten nicht korrekt!';
          } else {
            this.loginEvent.emit({
              isValidUser: result
            });
          }
        },
        error => {
          this.headerMsg = 'Fehler beim Login!';
          this.logger.error(error.message);
        }
      );
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
