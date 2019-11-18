import { CouchDBService } from 'src/app//services/couchDB.service';
import { EnvService } from './env.service';
import {
  TestBed,
  inject,
  tick,
  fakeAsync,
  getTestBed
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

describe('CouchDBService', () => {
  let injector: TestBed;
  let service: CouchDBService;
  let httpMock: HttpTestingController;
  let env: EnvService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EnvService, CouchDBService]
    });

    injector = getTestBed();
    service = injector.get<CouchDBService>(CouchDBService);
    httpMock = injector.get(HttpTestingController);

    console.log(service);
  });

  describe('#getNorms', () => {
    it('should return an Observable<User[]>', () => {
      fakeAsync(() => {
        const dummyNomr = {
          _id: '0a46e2ab-c3af-4bf1-af4d-2af1a421cbb3',
          _rev: '10-a5f0e30f0d40038580a802831c90e0a5',
          type: 'norm',
          normNumber: 'AIPS03-11-001',
          revision: 'Issue 8',
          revisionDate: '2016-12-31T23:00:00.000Z',
          normLanguage: 'en',
          description: {
            de: 'Metallbearbeitung',
            en: 'Machining of Metallics',
            fr: ''
          },
          scope:
            'This Airbus Process Specification defines the requirements for Machining of Metallics.',
          active: true,
          relatedNorms: [],
          users: [],
          tags: [
            {
              id: '8c5a90580e301532469047df5a0286e5',
              name: 'Airbus',
              tagType: 'level1',
              active: true
            }
          ],
          owner: '',
          revisions: [
            {
              date: '2019-10-16T12:57:47.810Z',
              name: '0a46e2ab-c3af-4bf1-af4d-2af1a421cbb3_issue8.pdf',
              revisionID: 'Issue 8',
              path: '/assets/uploads/'
            }
          ],
          _attachments: {
            '0a46e2ab-c3af-4bf1-af4d-2af1a421cbb3_issue8.pdf': {
              content_type: 'application/pdf',
              revpos: 2,
              digest: 'md5-TdAPYBc9v04X+nklgad/qw==',
              length: 94600,
              stub: true
            }
          }
        };

        console.log('service');
        console.log(service);
        let test = service
          .fetchEntries(
            'http://127.0.0.1:5984/norm_documents/_design/norms/_view/all-norms?include_docs=true'
          )
          .toPromise();
        /* .subscribe(docs => {
            console.log('docs');
            console.log(docs);
            expect(docs.length).toBe(2);
            expect(docs).toEqual(dummyNomr);
          }); */

        /* const req = httpMock.expectOne('http://127.0.0.1:5984/norm_documents');
        expect(req.request.method).toBe('GET');
        req.flush(dummyNomr); */
        expect(test[0].normNumber).not.toContain('AIPS03-11-001');
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

/* it('should be initialized', inject([EnvService], (env: EnvService) => {
    expect(env).toBeTruthy();
  }));

  it('should get the data successful', () => {
    service.fetchEntries('/').subscribe((data: any) => {
      expect(data.name).toBe('Luke Skywalker');
    });

    const req = httpMock.verify(
      'http://127.0.0.1:5984/norm_documents/_design/norms/_view/all-groups?include_docs=true'
    );
    expect(req.request.method).toBe('GET');
  });
}); */

/* describe('ValueService', () => {
  let service: CouchDBService;
  beforeEach(() => {
    service = new CouchDBService(new EnvService(), new HttpClient(''));
  });

  it('#getValue should return real value', () => {
    expect(service.getValue()).toBe('real value');
  });

  it('#getObservableValue should return value from observable', (done: DoneFn) => {
    service.getObservableValue().subscribe(value => {
      expect(value).toBe('observable value');
      done();
    });
  });

  it('#getPromiseValue should return value from a promise', (done: DoneFn) => {
    service.getPromiseValue().then(value => {
      expect(value).toBe('promise value');
      done();
    });
  });
});
 */
