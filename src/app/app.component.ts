import { Component, OnInit } from '@angular/core';
import { CouchDBService } from './shared/services/couchDB.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Normenverwaltung';

  private dataStore: any;

  userName = 'root';
  passWord = 'root';

  constructor(private couchDBService: CouchDBService) {}

  ngOnInit() {
    const params = {
      username: this.userName,
      password: this.passWord
    };
  }
}
