import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { NGXLogger } from 'ngx-logger';
import * as _ from 'underscore';
import { SubSink } from 'SubSink';

import { MessagingService } from './../../services/messaging.service';
import { DocumentService } from './../../services/document.service';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { AuthenticationService } from './../../modules/auth/services/authentication.service';
import { User } from '@app/models';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {
  subsink = new SubSink();
  currentUser: User;
  currentUserId: string;
  userName: string;
  userId: string;
  userRev: string;
  userRole: string;
  date: Date;
  confirmedDate: Date;
  associatedNorms: Array<any>;
  selectedAssocNorms: Array<any>;
  firstName: string;
  lastName: string;

  ownerData = {};

  constructor(
    private documentService: DocumentService,
    private authService: AuthenticationService,
    private couchDBService: CouchDBService,
    private router: Router,
    private messagingService: MessagingService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.initComponent();
  }

  private initComponent() {
    this.currentUserId = this.authService.getCurrentUserID();
    this.userName = this.authService.getCurrentUserFullName();
    this.userRole = this.authService.getUserRole();

    if (this.userRole === 'owner') {
      this.setOwnerData();
    } else {
      this.setUserData(this.currentUserId);
    }
  }

  public setUserData(id: string) {
    this.subsink.sink = this.couchDBService.fetchEntry('/' + id).subscribe(
      user => {
        this.currentUser = user;

        this.userId = this.authService.getCurrentUserID();
        this.userRev = this.currentUser['_rev'];
        this.userName = this.authService.getCurrentUserFullName();
        this.userRole = this.authService.getUserRole();
        this.associatedNorms = _.uniq(
          this.currentUser['associatedNorms'],
          'normId'
        );
      },
      error => this.logger.error(error.message),
      () => {}
    );
  }

  public setOwnerData() {
    console.log('setOwnerData');
    const ownerQuery = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: {
          $gt: null
        },
        type: {
          $eq: 'norm'
        },
        owner: {
          _id: {
            $eq: this.currentUserId
          }
        }
      }
    };

    this.subsink.sink = this.couchDBService.search(ownerQuery).subscribe(
      result => {
        this.ownerData['norms'] = {};

        result.docs.forEach(norm => {
          this.ownerData['norms'][norm.normNumber] = {};
          this.ownerData['norms'][norm.normNumber]['id'] = norm._id;

          console.log();
          this.ownerData['norms'][norm.normNumber]['users'] = {};

          norm.users.forEach(userId => {
            const userQuery = {
              use_index: ['_design/search_norm'],
              selector: {
                _id: {
                  $eq: userId
                },
                type: {
                  $eq: 'user'
                },
                $and: [
                  {
                    associatedNorms: {
                      $elemMatch: {
                        normNumber: {
                          $eq: norm.normNumber
                        }
                      }
                    }
                  }
                ]
              }
            };

            this.couchDBService.search(userQuery).subscribe(
              user => {
                if (user.docs.length > 0) {
                  user.docs.forEach(userData => {
                    this.ownerData['norms'][norm.normNumber]['users'][
                      userData['_id']
                    ] = {};

                    this.ownerData['norms'][norm.normNumber]['users'][
                      userData['_id']
                    ]['name'] =
                      userData['firstName'] + ' ' + userData['lastName'];

                    this.ownerData['norms'][norm.normNumber]['users'][
                      userData['_id']
                    ]['name'] =
                      userData['firstName'] + ' ' + userData['lastName'];

                    this.ownerData['norms'][norm.normNumber]['users'][
                      userData['_id']
                    ]['associatedNorms'] = {};

                    // this.ownerData['norms'][norm.normNumber]['id']['name'] = users.firstName + ' ' + users.lastName;
                    this.ownerData['norms'][norm.normNumber]['users'][
                      userData['_id']
                    ]['associatedNorms'] = _.uniq(
                      userData.associatedNorms,
                      'normId'
                    ).filter(obj => {
                      return obj['normId'] === norm._id;
                    });
                  });
                }
              },
              error => this.logger.error(error.message)
            );
          });
        });
      },
      error => this.logger.error(error.message)
    );
  }

  public getUpdateNormUser(id: string): Observable<User> {
    return this.couchDBService.fetchEntry('/' + id);
  }

  public inform(normId: string, userId: string) {
    this.subsink.sink = this.getUpdateNormUser(userId).subscribe(
      user => {
        const informUser = user;

        const now = new Date();
        const isoString = now.toISOString();

        informUser['associatedNorms'].map(asocN => {
          if (asocN['normId'] === normId) {
            asocN['informed'] = true;
            asocN['informedDate'] = isoString;
          }
          return asocN;
        });

        const messageParams = {};
        messageParams['userMail'] = informUser['email'];
        messageParams['normId'] = normId;

        this.subsink.sink = this.messagingService
          .sendMessage(messageParams)
          .subscribe(
            send => {
              console.log(send);
            },
            error => {
              this.logger.error(error.message);
            }
          );

        this.subsink.sink = this.couchDBService
          .writeEntry(informUser)
          .subscribe(
            result => {
              this.setOwnerData();
            },
            error => this.logger.error(error.message)
          );
      },
      error => this.logger.error(error.message)
    );
  }

  public gotoNorm(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
  }

  public confirm(id: string) {
    this.setUserData(this.currentUserId);

    const now = new Date();
    const isoString = now.toISOString();

    this.currentUser['associatedNorms'].map(asocN => {
      if (asocN['normId'] === id) {
        asocN['confirmed'] = true;
        asocN['confirmedDate'] = isoString;
      }
      return asocN;
    });

    this.subsink.sink = this.couchDBService
      .writeEntry(this.currentUser)
      .subscribe(
        result => {
          this.setUserData(this.currentUserId);
        },
        error => {
          this.logger.error(error.message);
        }
      );
  }

  public getDownload(id: string, name: string) {
    this.documentService.getDownload(id, name);
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
