import { Tag } from './../models/tag.model';
import { DocumentService } from 'src/app/services/document.service';
import { TestBed, fakeAsync, tick, async } from '@angular/core/testing';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { HttpClient } from '@angular/common/http';
import { NormDocument, User } from '@app/models';
import { NGXLogger } from 'ngx-logger';

describe('DocumentService test', () => {
  let serviceUnderTest: DocumentService;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let httpSpy: Spy<HttpClient>;
  let fakeNormDocuments: NormDocument[];
  let fakeNormDocument: NormDocument;
  let fakeTags: Tag[];
  let fakeUsers: User[];
  let fakeOwners: User[];
  let fakeAttributes: any;
  let actualResult: any;

  Given(() => {
    TestBed.configureTestingModule({
      providers: [
        DocumentService,
        {
          provide: CouchDBService,
          useValue: createSpyFromClass(CouchDBService)
        },
        {
          provide: HttpClient,
          useValue: createSpyFromClass(HttpClient)
        },
        {
          provide: NGXLogger,
          useValue: createSpyFromClass(NGXLogger)
        }
      ]
    });

    serviceUnderTest = TestBed.get(DocumentService);
    couchDBServiceSpy = TestBed.get(CouchDBService);
    httpSpy = TestBed.get(HttpClient);

    fakeNormDocuments = undefined;
    fakeNormDocument = undefined;
    fakeTags = undefined;
    fakeUsers = undefined;
    fakeOwners = undefined;
    actualResult = undefined;
  });

  /* describe('METHOD: getDocument()', () => {
    const id = '1';
    Given(() => {
      fakeNormDocument = {
        _id: '1',
        _rev: '1',
        type: 'user',
        normNumber: 'AAA'
      };
      httpSpy.get.and.nextOneTimeWith(fakeNormDocument);
    });

    When(
      fakeAsync(() => {
        serviceUnderTest.getDocument('/' + id).subscribe(value => {
          actualResult = value;
        });
      })
    );

    Then(() => {
      expect(actualResult).toEqual(fakeNormDocument);
      expect(actualResult.length).not.toBeNull();
    });
  });*/

  describe('METHOD: filterDocumentsByAccess(docs)', () => {
    Given(() => {
      // @ts-ignore
      spyOn(serviceUnderTest, 'filterDocumentsByAccess').and.callThrough();
      /*
    Expected [ Object({ _id: '1', _rev: '1', active: true, normNumber: 'Normnumber', owner: '1000', ownerExtended: Object({ _id: '1', _rev: '1', externalID: '1000', firstName: 'owner name', type: 'user' }), type: 'document' }), Object({ _id: '2', _rev: '2', active: true, normNumber: 'Normnumber 2', owner: '1000', ownerExtended: Object({ _id: '1', _rev: '1', externalID: '1000', firstName: 'owner name', type: 'user' }), type: 'document' }) ]
    to equal [ Object({ _id: '1', _rev: '1', active: true, normNumber: 'Normnumber', owner: '1000', ownerExtended: Object({ _id: '1', firstName: 'owner name', type: 'user' }), type: 'document' }), Object({ _id: '2', _rev: '2', active: true, normNumber: 'Normnumber 2', owner: '1000', ownerExtended: Object({ _id: '1', firstName: 'owner name', type: 'user' }), type: 'document' }) ]
    */
      fakeUsers = [
        {
          _id: '1',
          _rev: '1',
          type: 'user',
          firstName: 'owner name',
          externalID: '1000'
        },
        {
          _id: '1',
          _rev: '1',
          type: 'user',
          firstName: 'owner 2',
          externalID: '1001'
        }
      ];
      serviceUnderTest.owners = fakeUsers;
      fakeNormDocuments = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber',
          owner: '1000',
          active: true
        },
        {
          _id: '2',
          _rev: '2',
          type: 'document',
          normNumber: 'Normnumber 2',
          active: true
        }
      ];

      actualResult = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber',
          owner: '1000',
          ownerExtended: {
            _id: '1',
            _rev: '1',
            externalID: '1000',
            firstName: 'owner name',
            type: 'user'
          },
          active: true
        }
      ];
      // @ts-ignore
      /* expectedObject = componentUnderTest.filterDocumentsByAccess(
        fakeDocuments
      ); */
    });

    When(() => {
      // @ts-ignore
      actualResult = serviceUnderTest.filterDocumentsByAccess(
        fakeNormDocuments
      );
      console.log(actualResult);
    });

    Then(() => {
      // @ts-ignore
      expect(expectedObject).toEqual(modifiedDocs);
    });
  });

  /* describe('setPublisherFromTags', () => {
    Given(() => {
      serviceUnderTest.documents = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber',
          tags: [
            {
              id: 'e88637ef0c7d07557cab7140ad02ce35',
              name: 'Boeing',
              tagType: 'level1',
              active: true
            },
            {
              id: 'e88637ef0c7d07557cab7140ad02ce35',
              name: 'Tessla',
              tagType: 'level2',
              active: true
            }
          ]
        },
        {
          _id: '2',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber2',
          tags: [
            {
              id: 'e88637ef0c7d07557cab7140ad02ce35',
              name: 'Boeing',
              tagType: 'level1',
              active: true
            },
            {
              id: 'e88637ef0c7d07557cab7140ad02ce35',
              name: 'Tessla',
              tagType: 'level2',
              active: true
            }
          ]
        }
      ];

      // @ts-ignores
      spyOn(componentUnderTest, 'setPublisherFromTags').and.callThrough();
    });

    When(() => {
      // @ts-ignores
      componentUnderTest.setPublisherFromTags();
    });

    Then(() => {
      // expect(serviceUnderTest.documents[0]['publisher']).toEqual('Boeing');
    });
  }); */

  describe('METHOD: getDocuments()', () => {
    const id = '1';
    Given(() => {
      fakeNormDocuments = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'AAA'
        }
      ];

      couchDBServiceSpy.fetchEntries.and.nextWith(fakeNormDocuments);
      couchDBServiceSpy.fetchEntries.and.complete();
    });

    When(
      fakeAsync(async () => {
        // with additional async and await
        // Short form for
        actualResult = await serviceUnderTest.getDocuments();
      })
    );

    Then(() => {
      fakeNormDocuments = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'AAA'
        }
      ];
      expect(actualResult).toEqual(fakeNormDocuments);
      expect(actualResult.length).toBeGreaterThan(0);
    });
  });

  describe('METHOD: getSelectedOwner()', () => {
    const ownerId = ['1', '2'];
    Given(() => {
      fakeUsers = [
        {
          _id: '1',
          _rev: '1',
          type: 'user',
          firstName: 'Max'
        }
      ];
      spyOn(serviceUnderTest, 'getUsers').and.returnValue(
        Promise.resolve(fakeUsers)
      );
    });

    When(() => {
      actualResult = serviceUnderTest.getSelectedOwner(ownerId);
    });

    Then(() => {
      fakeOwners = [
        {
          _id: '1',
          _rev: '1',
          type: 'user',
          firstName: 'Max'
        }
      ];

      expect(actualResult).toEqual(fakeOwners);
    });
  });

  describe('METHOD: getTags()', () => {
    Given(() => {
      fakeTags = [
        {
          _id: '0a46e2ab-c3af-4bf1-af4d-2af1a421cbb3',
          _rev: '10-a5f0e30f0d40038580a802831c90e0a5',
          type: 'tag',
          name: 'Ein Tag'
        }
      ];
      couchDBServiceSpy.fetchEntries.and.nextOneTimeWith(fakeTags);
    });

    When(() => {
      serviceUnderTest.getTags().subscribe(result => (actualResult = result));
    });

    Then(() => {
      expect(actualResult).toEqual(fakeTags);
      expect(actualResult.length).toBeGreaterThan(0);
    });
  });

  describe('METHOD: getLatestAttchmentFileName', () => {
    Given(() => {
      fakeAttributes = {
        '1.pdf': {
          revpos: 1
        },
        '2.pdf': {
          revpos: 3
        },
        '3.pdf': {
          revpos: 2
        }
      };
    });

    describe('GIVEN attachments THEN latest to be true', () => {
      When(() => {
        actualResult = serviceUnderTest.getLatestAttchmentFileName(
          fakeAttributes
        );
      });

      Then(() => {
        expect(actualResult).toEqual('2.pdf');
      });
    });

    describe('GIVEN attachments THEN latest to be false', () => {
      When(() => {
        actualResult = serviceUnderTest.getLatestAttchmentFileName(
          fakeAttributes
        );
      });

      Then(() => {
        expect(actualResult).not.toEqual('1.pdf');
      });
    });
  });
});
