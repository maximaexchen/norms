import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // The values that are defined here are the default values that can
  // be overridden by env.js
  public envFileLoaded = false;

  // Whether or not to enable debug mode
  public enableDebug = true;

  public dbBaseUrl = 'http://116.203.220.19:5984/';
  public dbName = 'norm_rep2';

  public uploadUrl = 'http://localhost:4000/api/upload';
  public uploadDir = './dist/wakandaAngular/assets/uploads/';
  public uploadRoot = './dist/wakandaAngular/';

  constructor() {}
}
