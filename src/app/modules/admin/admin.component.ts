import { Component, OnInit, ViewChild } from '@angular/core';
import { SubSink } from 'SubSink';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  @ViewChild('dbForm', { static: false }) dbForm: NgForm;
  @ViewChild('dbForm2', { static: false }) dbForm2: NgForm;
  subsink = new SubSink();
  dbUser: string;
  dbPassword: string;
  dbName: string;
  docCount: number;
  docDelCount: number;
  diskSize: number;

  constructor(private couchDBService: CouchDBService) {}

  ngOnInit() {
    this.getDBState();
  }

  private getDBState() {
    this.subsink.sink = this.couchDBService.getDBState().subscribe(
      result => {
        this.dbName = result.db_name;
        this.docCount = result.doc_count;
        this.docDelCount = result.doc_del_count;
        this.diskSize = +(result.disk_size / (1024 * 1024)).toFixed(2);
      },
      error => {},
      () => {}
    );
  }

  public compactDB() {
    this.couchDBService.compactDB(this.dbName, this.dbUser, this.dbPassword);
  }

  public deleteDB() {
    this.couchDBService.deleteDB(this.dbName, this.dbUser, this.dbPassword);
  }
}
