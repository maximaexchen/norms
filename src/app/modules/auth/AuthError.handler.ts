import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error) {
    const router = this.injector.get(Router);

    if (error instanceof HttpErrorResponse) {
      //Backend returns unsuccessful response codes such as 404, 500 etc.
      console.error('Backend returned status code: ', error.status);
      console.error('Response body:', error.message);
      if (error.status === 401 || error.status === 403) {
        router.navigate(['/login']);
      }
    } else {
      //A client-side or network error occurred.
      console.error('An error occurred:', error.message);
    }

    throw error;
  }
}
