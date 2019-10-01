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
    const req = new HttpRequest('GET', url);
    return this.http.request(req);
  }

  public uploadFile(
    url: string,
    file: File,
    createID: string,
    uploadDir: string
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();

    console.log('ppppppppp');
    console.log(file);
    console.log(file.name);
    console.log(createID);
    console.log(uploadDir);
    console.log('ppppppppp');
    formData.append('uploadFile', file, file.name);
    formData.append('createID', createID);
    formData.append('uploadDir', uploadDir);

    const params = new HttpParams();

    const options = {
      params,
      reportProgress: true
    };

    const req = new HttpRequest('POST', url, formData, options);
    return this.http.request(req);
  }
}
