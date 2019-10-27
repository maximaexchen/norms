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
  @Output() valueChange = new EventEmitter();
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

    this.authService.login(this.userName, this.passWord).subscribe(result => {
      console.log('LoginComponent login');
      console.log(result);
    });
    /* console.log('LoginComponent login');
    this.headerMsg = '';
    const params = {
      username: this.userName,
      password: this.passWord
    };
    from(this.backend.login(params)).subscribe(
      res => {
        console.log('res');
        console.log(res);
        this.display = !res['success'];
        this.headerMsg = res['msg'];
        from(this.backend.currentUser).subscribe(usr => {
          console.log('usr');
          console.log(usr);
          this.valueChange.emit({
            isValidUser: res['success'],
            ID: usr['ID'],
            fullName: usr['fullName']
          });
        });
      },
      err => {
        this.headerMsg = 'Fehler beim Login!';
      }
    );*/
  }
}
