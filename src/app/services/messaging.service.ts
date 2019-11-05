import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpParams,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({ providedIn: 'root' })
export class MessagingService {
  constructor(private http: HttpClient, private env: EnvService) {}

  sendMessage(body): Observable<any> {
    console.log('send message');
    console.log(body);
    const url = this.env.apiUrl + '/api/sendmail/';

    const params = new HttpParams()
      .append('test1', 'JAJA')
      .append('test2', 'TATA');

    const emails = [
      'kontakt@marcus-bieber.de',
      'maximaexchen@gmx.de',
      'mb@moon-media.biz'
    ];

    const normId = '80-T-34-9600';

    return this.http.post(this.env.apiUrl + '/api/sendmail/', {
      normId,
      emails
    });

    /* const headers = new HttpHeaders({
      normId,
      emails
    });

    const options = {
      params,
      reportProgress: true,
      headers
    };

    return this.http.request(new HttpRequest('POST', url, headers, options)); */
    /*
    return this.http.post(
      this.env.apiUrl + '/api/sendmail/',
      { emails, normId },
      {
        headers: new HttpHeaders().set(
          'Content-Type',
          'application/x-www-form-urlencoded'
        )
      }
    );  */
  }
}
