import {
  AbstractControl,
  ValidatorFn,
  Validator,
  FormControl,
  NG_VALIDATORS
} from '@angular/forms';
import { Directive } from '@angular/core';

function asciiInputValidator(): ValidatorFn {
  return (c: AbstractControl) => {
    const notValid = /^(?:(?!["';<=>\\])[\x20-\x7E])+$/u.test(c.value);
    if (!notValid) {
      return {
        asciiInput: {
          notValid: true
        }
      };
    } else {
      return null;
    }
  };
}

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[asciiInputValidator][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: AsciiInputValidatorDirective,
      multi: true
    }
  ]
})
export class AsciiInputValidatorDirective implements Validator {
  validator: ValidatorFn;

  constructor() {
    this.validator = asciiInputValidator();
  }

  validate(c: FormControl) {
    console.log(c);
    return this.validator(c);
  }
}
