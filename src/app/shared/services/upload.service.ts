import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpEvent
} from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

@Injectable()
export class UploadService {
  constructor(private http: HttpClient) {}

  // file from event.target.files[0]
  uploadFile(
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
