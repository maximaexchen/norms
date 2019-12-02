import { TestBed } from '@angular/core/testing';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { HttpClient } from '@angular/common/http';
import { Role } from '@app/models';

describe('CouchDBService test', () => {
  let serviceUnderTest: CouchDBService;
  let httpSpy: Spy<HttpClient>;
  let fakeRolesInput: {};
  let fakeRolesOutput: Role[];
  let actualResult: any;

  Given(() => {
    TestBed.configureTestingModule({
      providers: [
        CouchDBService,
        { provide: HttpClient, useValue: createSpyFromClass(HttpClient) }
      ]
    });

    serviceUnderTest = TestBed.get(CouchDBService);
    httpSpy = TestBed.get(HttpClient);

    fakeRolesInput = undefined;
    fakeRolesOutput = undefined;
    actualResult = undefined;
  });

  describe('METHOD: getRoles()', () => {
    When(() => {
      serviceUnderTest.getRoles().subscribe(value => (actualResult = value));
    });

    describe('GIVEN successfull request THEN return the roles', () => {
      Given(() => {
        fakeRolesInput = {
          total_rows: 5,
          offset: 0,
          rows: [
            {
              id: '8500a076a88ffed3ac2aa28d57002bf8',
              key: 'Admin',
              value: '8500a076a88ffed3ac2aa28d57002bf8',
              doc: {
                _id: '8500a076a88ffed3ac2aa28d57002bf8',
                _rev: '2-1fb2de93db6cd5d532ffce4a33b53f8a',
                type: 'role',
                name: 'Admin',
                active: false
              }
            }
          ]
        };
        httpSpy.get.and.nextOneTimeWith(fakeRolesInput);
      });

      Then(() => {
        fakeRolesOutput = [
          {
            _id: '8500a076a88ffed3ac2aa28d57002bf8',
            _rev: '2-1fb2de93db6cd5d532ffce4a33b53f8a',
            active: false,
            name: 'Admin',
            type: 'role'
          }
        ];
        expect(actualResult).toEqual(fakeRolesOutput);
      });
    });
  });
});
