import { Tag } from './../models/tag.model';
import { DocumentService } from 'src/app/services/document.service';
import {
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick
} from '@angular/core/testing';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { HttpClient } from '@angular/common/http';
import { NormDocument } from '@app/models';
import { NGXLogger } from 'ngx-logger';

describe('DocumentService test', () => {
  let serviceUnderTest: DocumentService;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let httpSpy: Spy<HttpClient>;
  let fakeNormDocuments: NormDocument[];
  let fakeTags: Tag[];
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
        { provide: HttpClient, useValue: createSpyFromClass(HttpClient) },
        { provide: NGXLogger, useValue: createSpyFromClass(NGXLogger) }
      ]
    });

    serviceUnderTest = TestBed.get(DocumentService);
    couchDBServiceSpy = TestBed.get(CouchDBService);
    httpSpy = TestBed.get(HttpClient);

    fakeNormDocuments = undefined;
    fakeTags = undefined;
    actualResult = undefined;
  });

  describe('METHOD: getTags', () => {
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
