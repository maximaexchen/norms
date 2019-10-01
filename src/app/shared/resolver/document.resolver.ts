import { DocumentService } from 'src/app/services/document.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';

@Injectable()
export class DocumentResolver implements Resolve<Observable<string>> {
  constructor(private documentService: DocumentService) {}

  resolve() {
    return null; // this.apiService.readEntry();
  }
}
