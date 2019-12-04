import { Directive, forwardRef } from '@angular/core';
import {
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  Validator,
  FormControl
} from '@angular/forms';

@Directive({
  selector: '[asciiInputValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: AsciiInputValidatorDirective,
      multi: true
    }
  ]
})
export class AsciiInputValidatorDirective implements Validator {
  validate(c: FormControl): ValidationErrors | null {
    return AsciiInputValidatorDirective.asciiInputValidator(c);
  }

  static asciiInputValidator(control: FormControl): ValidationErrors | null {
    const isValid = /^(?:(?!["';<=>\\])[\x20-\x7E])+$/u.test(control.value);
    if (!isValid) {
      // Return error if card is not Amex, Visa or Mastercard
      return {
        asciiInput:
          'Your credit card number is not from a supported credit card provider'
      };
    } else if (control.value.length !== 16) {
      console.log(control.value);
      // Return error if length is not 16 digits
      return { asciiInput: 'A credit card number must be 16-digit long' };
    }
    // If no error, return null
    return null;
  }
}
