import { AuthenticationService } from '@modules/auth/services/authentication.service';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { from } from 'rxjs';
import { Router } from '@angular/router';
import { resolve } from 'q';

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
  private user: any;

  constructor(
    private backend: CouchDBService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('LoginComponent ready');
  }

  public login() {
    console.log('LOGIN');

    const params = {
      username: this.userName,
      password: this.passWord
    };

    this.authService.login(this.userName, this.passWord).subscribe(
      result => {
        console.log('LoginComponent login');
        console.log(result);

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
