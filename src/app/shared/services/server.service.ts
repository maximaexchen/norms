import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpEvent
} from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

@Injectable()
export class ServerService {
  constructor(private http: HttpClient) {}

  public findDirectory(id: string): Observable<HttpEvent<any>> {
    const url = 'http://localhost:4000/api/findDirectory/' + id;
    const req = new HttpRequest('GET', url);
    return this.http.request(req);
  }

  public uploadFile(
    url: string,
    file: File,
    createID: string
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('uploadFile', file, file.name);
    formData.append('createID', createID);

    const params = new HttpParams();

    const options = {
      params,
      reportProgress: true
    };

    const req = new HttpRequest('POST', url, formData, options);
    return this.http.request(req);
  }
}
