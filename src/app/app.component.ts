import { Component, OnInit, Injector } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';

import { CouchDBService } from './/services/couchDB.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Normenverwaltung';

  private dataStore: any;
  public user: any;

  userName = 'root';
  passWord = 'root';

  constructor(
    private couchDBService: CouchDBService,
    private injector: Injector,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const params = {
      username: this.userName,
      password: this.passWord
    };
  }

  public setUserValidation(user) {
    this.user = user;
  }
}
