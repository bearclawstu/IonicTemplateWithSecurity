import {FormControl} from "@angular/forms";

export class PasswordValidator {
    static isValid(control: FormControl): any {
        if (!control.parent || !control.parent.value) {
            return null;
        }

        console.log(control.parent.value.newPassword);
        if (control.value === control.parent.value.newPassword) {
            return null;
        } else {
            return 'Passwords do not match';
        }

    }
}
