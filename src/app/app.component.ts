import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { CouchDBService } from './shared/services/couchDB.service';
import { MessageService } from 'primeng/components/common/messageservice';

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

  /*
  "C:\Program Files (x86)\Wakanda\Enterprise\Server\wakanda-enterprise-server.exe" C:\Users\itspoon\Documents\Wakanda\solutions\Documents\app.waSolution /admin-port:8090
*/
  ngOnInit() {
    const params = {
      username: this.userName,
      password: this.passWord
    };
  }
}
