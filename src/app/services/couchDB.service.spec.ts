import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { Role } from '@app/models';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';

describe('CouchDBService test', () => {
  let serviceUnderTest: CouchDBService;
  let httpSpy: Spy<HttpClient>;
  let fakeObject: any;
  let expectestFakeObject: any;
  let fakeRolesInput: {};
  let fakeRolesOutput: Role[];
  let actualResult: any;

  Given(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CouchDBService]
    });

    serviceUnderTest = TestBed.get(CouchDBService);
    httpSpy = TestBed.get(HttpClient);

    fakeObject = undefined;
    expectestFakeObject = undefined;
    fakeRolesInput = undefined;
    fakeRolesOutput = undefined;
    actualResult = undefined;
  });

  /* it('should writeEntry', fakeAsync(
    inject(
      [HttpTestingController, CouchDBService],
      (httpMock: HttpTestingController, dataService: CouchDBService) => {
        const mockObject = {
          normNumber: '80-T-35-0100'
        };

        dataService.writeEntry(fakeObject).subscribe(objectData => {
          expect(objectData.normNumber).toEqual('80-T-35-0100');
          console.log(event.type);
            switch (event.type) {
              case HttpEventType.Response:
                expect(event.body).toEqual(mockObject);
            }
        });

        const mockReq = httpMock.expectOne(dataService.dbRequest);
        expect(mockReq.request.method).toEqual('POST');
        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');

        mockReq.flush(mockObject);

        httpMock.verify();
      }
    )
  )); */

  /* describe('METHOD writeEntry', () => {
    When(() => {
      serviceUnderTest
        .writeEntry(fakeObject)
        .subscribe(value => (expectestFakeObject = value));
    });

    describe('GIVEN a successful request THEN return a object', () => {
      Given(() => {
        fakeObject = {
          normNumber: '80-T-35-0100'
        };
        console.log('#####################');
        console.log(httpSpy.post.and);
        console.log('#####################');
        httpSpy.post.and.nextOneTimeWith(fakeObject);
      });

      Then(() => {
        expect(expectestFakeObject).toEqual(fakeObject);
      });
    });
  }); */

  /* describe('METHOD fetchEntries', () => {
    When(() => {
      serviceUnderTest
        .fetchEntries(null)
        .subscribe(value => (expectestFakeObject = value));
    });

    describe('GIVEN a successful request THEN return objects', () => {
      Given(() => {
        fakeObject = [
          {
            normNumber: '80-T-35-0100'
          }
        ];
        httpSpy.get.and.nextOneTimeWith(fakeObject);
      });

      Then(() => {
        expect(expectestFakeObject).toEqual(fakeObject);
      });
    });
  }); */

  /* describe('METHOD updateEntry', () => {
    When(() => {
      serviceUnderTest.updateEntry(fakeObject, '1').subscribe(value => {
        expectestFakeObject = value;
      });
    });

    describe('GIVEN a successful request THEN return a object', () => {
      Given(() => {
        fakeObject = {
          ok: true,
          id: '1',
          rev: '1'
        };

        httpSpy.put.and.nextOneTimeWith(fakeObject);
      });

      Then(() => {
        expect(expectestFakeObject).toEqual(fakeObject);
      });
    });
  });

  describe('METHOD deleteEntry', () => {
    When(() => {
      serviceUnderTest.deleteEntry('1', '1').subscribe(value => {
        expectestFakeObject = value;
      });
    });

    describe('GIVEN a successful request THEN return a object', () => {
      Given(() => {
        fakeObject = {
          _id: '1',
          name: 'MyName'
        };

        httpSpy.delete.and.nextOneTimeWith(fakeObject);
      });

      Then(() => {
        expect(expectestFakeObject).toEqual(fakeObject);
      });
    });
  });

  describe('METHOD fetchEntry', () => {
    When(() => {
      serviceUnderTest.fetchEntry('1').subscribe(value => {
        expectestFakeObject = value;
      });
    });

    describe('GIVEN a successful request THEN return a object', () => {
      Given(() => {
        fakeObject = {
          _id: '1',
          _rev: '1',
          name: 'Customer name'
        };

        httpSpy.get.and.nextOneTimeWith(fakeObject);
      });

      Then(() => {
        expect(expectestFakeObject).toEqual(fakeObject);
      });
    });
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
  }); */
  /* describe('METHOD: setStateUpdate', () => {
    Given(() => {
      // @ts-ignore
      serviceUnderTest.updateSubject.next('Test2');
      spyOn(serviceUnderTest, 'setStateUpdate');
    });

    When(() => {
      // @ts-ignore
      serviceUnderTest.setStateUpdate();
    });

    Then(
      fakeAsync(() => {
        // @ts-ignore
        serviceUnderTest.setStateUpdate().subscribe(res => {
          console.log('PP: ' + res);
          expect(res).toEqual('Test2a');
        });
        tick(100000);
      })
    );
  }); */
});
