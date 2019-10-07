import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpEvent
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
    createID: string,
    uploadDir: string
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();

    console.log('-------------------------------------');
    console.log(file);
    console.log(file.name);
    console.log(createID);
    console.log(uploadDir);
    console.log('-------------------------------------');
    formData.append('uploadFile', file, file.name);
    formData.append('createID', createID);
    formData.append('uploadDir', uploadDir);

    const params = new HttpParams();

    const options = {
      params,
      reportProgress: true
    };

    return this.http.request(new HttpRequest('POST', url, formData, options));
  }
}
