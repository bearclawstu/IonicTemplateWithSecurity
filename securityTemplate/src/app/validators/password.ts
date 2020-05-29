import {FormControl, FormGroup} from "@angular/forms";

export class PasswordValidator {
    static confirmPasswordsMatch(control: FormControl): any {

        if (!control.parent || !control.parent.value
            || !control.parent.value.confirmPassword || !control.parent.value.newPassword) {
            return null;
        }

        if (control.parent.value.newPassword === control.value) {
            return null;
        } else {
            return {confirmPasswordMatch: true};
        }
    }

    // used when the original password is modified after the confirm password has been validated
    static newPasswordsMatch(control: FormControl): any {
        if (!control.parent || !control.parent.value || !control.parent.value.confirmPassword) {
            return null;
        }

        if (control.value === control.parent.value.confirmPassword) {
            return null;
        } else {
            return {newPasswordMatch: true};
        }
    }

    static isValid(control: FormControl): any {

        if (!control || !control.value) {
            return null;
        }

        const re = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$');

        if (re.test(control.value)) {
            return null;
        } else {
            return {pattern: true};
        }

    }
}
