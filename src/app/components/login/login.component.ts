import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { from } from 'rxjs';

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

  constructor(private backend: CouchDBService) {}

  ngOnInit() {}

  public login() {
    this.headerMsg = '';
    const params = {
      username: this.userName,
      password: this.passWord
    };
    from(this.backend.login(params)).subscribe(
      res => {
        this.display = !res['success'];
        this.headerMsg = res['msg'];
        from(this.backend.currentUser).subscribe(usr => {
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
    );
  }
}
