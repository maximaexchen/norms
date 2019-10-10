import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpEvent,
  HttpHeaders
} from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServerService {
  constructor(private http: HttpClient) {}

  public findDirectory(id: string): Observable<HttpEvent<any>> {
    const url = 'http://localhost:4000/api/findDirectory/' + id;
    return this.http.request(new HttpRequest('GET', url));
  }

  public uploadFile(
    url: string,
    file: File,
    createid: string,
    uploadDir: string,
    revision: string
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();

    revision = revision.replace(/\s/g, '').toLowerCase();

    console.log('-------------------------------------');
    console.log(file);
    console.log(file.name);
    console.log(createid);
    console.log(uploadDir);
    console.log(revision);
    console.log('-------------------------------------');
    formData.append('uploadFile', file, file.name);
    formData.append('createID', createid);
    formData.append('uploadDir', uploadDir);
    formData.append('revision', revision);

    const params = new HttpParams();

    const headers = new HttpHeaders({
      revision,
      createid
    });

    const options = {
      params,
      reportProgress: true,
      headers
    };

    return this.http.request(new HttpRequest('POST', url, formData, options));
  }
}
