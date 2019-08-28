import { CouchDBService } from './../../shared/services/couchDB.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss']
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  document: Document;
  id: string;
  navigationSubscription;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseDocument();
      }
    });
  }

  initialiseDocument() {}

  ngOnInit() {
    this.route.data.subscribe(resolversData => {
      this.document = this.route.snapshot.data['document'];
    });

    /* this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      console.log(this.id);
      this.couchDBService.fetchEntry('/' + this.id).subscribe(results => {
        console.log(results);
        this.document = results;
      });
    }); */
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
