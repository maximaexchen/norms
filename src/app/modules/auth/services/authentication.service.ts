import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Md5 } from 'ts-md5/dist/md5';

import { User, Role } from '@models/index';
import { EnvService } from '@app/services/env.service';
import { CouchDBService } from './../../../services/couchDB.service';
import { PermissionManagerService } from './permissionManager.service';
import { Roles } from '../models/roles.enum';

export const TOKEN_NAME = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private userS: PermissionManagerService = new PermissionManagerService();
  private currentTokenSubject: BehaviorSubject<string>;
  public currentToken: Observable<string>;
  private apiUrl = this.env.uploadUrl;
  private permissions: Array<string>;
  private jwtHelper = new JwtHelperService();
  private user: User;
  private role: Role;
  private userIsLoggedIn = new Subject<string>();
  public userIsLoggedIn$ = this.userIsLoggedIn.asObservable();

  private userNameSubject = new Subject<string>();
  public userName$ = this.userNameSubject.asObservable();

  constructor(
    private env: EnvService,
    private http: HttpClient,
    private couchDBService: CouchDBService
  ) {
    this.currentTokenSubject = new BehaviorSubject<string>(
      sessionStorage.getItem('access_token')
    );
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public login(username: string, password: string): Observable<any> {
    const passw = Md5.hashStr(password);
    const params = {
      username,
      passw
    };

    const loginUserObs = this.couchDBService.getLoginUser(params);

    return loginUserObs.pipe(
      switchMap(
        (loginResult): Observable<boolean | any> => {
          console.log(loginResult);
          this.user = loginResult['docs'][0];

          if (!!this.user) {
            this.requestToken(username, password).subscribe(res => {
              this.role = this.user['role'];

              if (this.role) {
                this.userS.authAs(this.role as Roles);
              } else {
                this.userS.authAs('external' as Roles);
              }

              this.persistUserData(this.user);
              this.userIsLoggedIn.next('userIsLoggedIn');
              this.userNameSubject.next(this.getCurrentUserFullName());
            });

            return of(true);
          }
          return of(false);
        }
      )
    );
  }

  private persistUserData(user: User) {
    console.log(user);
    sessionStorage.setItem('userId', user['_id']);
    sessionStorage.setItem('userName', user['userName']);
    sessionStorage.setItem('firstName', user['firstName']);
    sessionStorage.setItem('lastName', user['lastName']);
    sessionStorage.setItem('email', user['email']);
  }

  public getUserRole(): string {
    return sessionStorage.getItem('role');
  }

  public getCurrentUser(): User {
    return this.user;
  }

  public getCurrentUserName(): string {
    return sessionStorage.getItem('userName');
  }

  public getCurrentUserID(): string {
    return sessionStorage.getItem('userId');
  }

  public getCurrentUserFullName(): string {
    return (
      sessionStorage.getItem('firstName') +
      ' ' +
      sessionStorage.getItem('lastName')
    );
  }

  public getCurrentUserEmail(): string {
    return sessionStorage.getItem('email');
  }

  private requestToken(
    username: string,
    password: string
  ): Observable<boolean> {
    return this.http
      .post<any>(this.env.apiUrl + '/api/auth', {
        username,
        password
      })
      .pipe(
        tap(result => {
          this.setToken(result.token);
        }), // do side effects
        map(data => true), // modify the data and return the value you care for
        catchError(error => of(false)) // return an Observable with the value that should be returned on errors
      );
  }

  public logout() {
    this.userS.removeAuth();
    this.removeToken();
    this.currentTokenSubject.next(null);
  }

  private getToken(): string {
    return sessionStorage.getItem(TOKEN_NAME);
  }

  private setToken(token: string): void {
    sessionStorage.setItem(TOKEN_NAME, token);
  }

  private removeToken() {
    sessionStorage.removeItem(TOKEN_NAME);
  }

  public getTokenExpirationDate(token: string): Date {
    const decoded = this.jwtHelper.decodeToken(token);

    if (decoded.exp === undefined) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  public isAuthenticated(): boolean {
    const token = sessionStorage.getItem(TOKEN_NAME);
    return !this.jwtHelper.isTokenExpired(token);
  }

  public get currentUserValue(): User {
    return this.currentTokenSubject.value;
  }
}
