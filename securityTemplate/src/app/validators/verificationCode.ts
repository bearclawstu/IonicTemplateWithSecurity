import {FormControl} from "@angular/forms";

export class VerificationCodeValidator {

    static isValid(control: FormControl): any {

        if (!control || !control.value) {
            return null;
        }

        if (control.value.toString().length === 6) {
            return null;
        } else {
            return {invalidVerification: true};
        }

    }
}
