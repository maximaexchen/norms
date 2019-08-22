import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Resolve } from '@angular/router';

@Injectable()
export class APIResolver implements Resolve<Observable<string>> {
  constructor(private apiService: CouchDBService) {}

  resolve() {
    return null; // this.apiService.readEntry();
  }
}
