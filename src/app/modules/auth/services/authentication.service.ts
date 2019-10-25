import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@models/index';
import { EnvService } from '@app/services/env.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  apiUrl = this.env.uploadUrl;

  constructor(private env: EnvService, private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      localStorage.getItem('access_token')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<boolean> {
    console.log('username');
    console.log(username);

    return this.http
      .post<any>(this.env.apiUrl + '/api/auth', {
        username: username,
        password: password
      })
      .pipe(
        map(result => {
          localStorage.setItem('access_token', result.token);
          return true;
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
  }
}
