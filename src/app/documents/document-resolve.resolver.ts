import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class DocumentResolve implements Resolve<Document> {
  constructor(private couchDBService: CouchDBService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.couchDBService.fetchEntry('/' + route.paramMap.get('id'));
  }
}
