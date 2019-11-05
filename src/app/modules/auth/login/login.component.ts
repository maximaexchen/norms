import { AuthenticationService } from '@modules/auth/services/authentication.service';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Output() loginEvent = new EventEmitter();
  public display = true;
  public headerMsg = '';
  public userName = '';
  public passWord = '';

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {}

  public login() {
    this.authService.login(this.userName, this.passWord).subscribe(
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
      err => {
        this.headerMsg = 'Fehler beim Login!';
      }
    );
  }
}
