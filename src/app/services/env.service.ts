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

  public dbIP = '127.0.0.1:5984';
  public dbBaseUrl = 'http://127.0.0.1:5984/';
  public dbName = 'norm_documents';

  public uploadUrl = 'http://localhost:4000/api/upload';
  public uploadDir = './dist/norms/assets/uploads/';
  public uploadRoot = './dist/norms/';
  public deleteUrl = 'http://localhost:4000/api/deleteFolder';

  public printPDFUrl = 'http://normenverwaltung/php/outputPDF.php';

  public apiUrl = 'http://localhost:4000';

  constructor() {}
}
