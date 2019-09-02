import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../user.model';
import { DocumentService } from 'src/app/shared/services/document.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User = [];
  changeSubscription: Subscription;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'user') {
          this.users = this.documentService.getUsers();
        }
      });
    console.log(this.documentService.getUsers());
    this.users = this.documentService.getUsers();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
