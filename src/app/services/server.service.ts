import { DocumentService } from 'src/app/services/document.service';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpEvent,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServerService {
  constructor(
    private http: HttpClient,
    private documentService: DocumentService
  ) {}

  public findDirectory(id: string): Observable<HttpEvent<any>> {
    const url = 'http://localhost:4000/api/findDirectory/' + id;
    return this.http.request(new HttpRequest('GET', url));
  }

  public uploadFileToServer(
    url: string,
    file: File,
    createid: string,
    uploadDir: string,
    filename: string
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('uploadFile', file, file.name);
    formData.append('createID', createid);
    formData.append('uploadDir', uploadDir);
    formData.append('filename', filename);

    const params = new HttpParams();

    const headers = new HttpHeaders({
      filename,
      createid
    });

    const options = {
      params,
      reportProgress: true,
      headers
    };

    return this.http.request(new HttpRequest('POST', url, formData, options));
  }

  public deleteFolderFromServer(
    url: string,
    deleteid: string,
    uploadDir: string,
    filename: string
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('deleteID', deleteid);
    formData.append('uploadDir', uploadDir);
    formData.append('filename', filename);

    const params = new HttpParams();

    const headers = new HttpHeaders({
      filename,
      deleteid
    });

    const options = {
      params,
      reportProgress: true,
      headers
    };

    return this.http.request(new HttpRequest('POST', url, formData, options));
  }
}
