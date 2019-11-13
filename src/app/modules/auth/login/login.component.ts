import { AuthenticationService } from '@modules/auth/services/authentication.service';
import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  OnDestroy
} from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  @Output() loginEvent = new EventEmitter();
  alive = true;
  public display = true;
  public headerMsg = '';
  public userName = '';
  public passWord = '';

  constructor(
    private authService: AuthenticationService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {}

  public login() {
    this.authService
      .login(this.userName, this.passWord)
      .pipe(takeWhile(() => this.alive))
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
    this.alive = false;
  }
}
