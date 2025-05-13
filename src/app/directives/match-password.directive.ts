// src/app/directives/match-password.directive.ts
import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appMatchPassword]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchPasswordDirective, multi: true }]
})
export class MatchPasswordDirective implements Validator {
  @Input('appMatchPassword') matchPasswordValue: string = '';

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
    const controlToCompare = control.root.get(this.matchPasswordValue);
    if (controlToCompare && controlToCompare.value !== control.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }
}
