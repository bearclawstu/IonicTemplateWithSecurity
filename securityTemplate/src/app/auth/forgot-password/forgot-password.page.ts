import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";
import {PasswordValidator} from "../../validators/password";
import {VerificationCodeValidator} from "../../validators/verificationCode";

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.page.html',
    styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
    promptSent = false;
    isLoading = false;
    forgotPasswordForm: FormGroup;
    resetPasswordForm: FormGroup;

    constructor(private authService: AuthService,
                private router: Router,
                private loadingCtrl: LoadingController,
                private alertCtrl: AlertController,
                private formBuilder: FormBuilder) {

        this.forgotPasswordForm = formBuilder.group({
            username: ['', Validators.required]
        });

        this.resetPasswordForm = formBuilder.group({
            verificationCode: ['', Validators.compose([Validators.required, VerificationCodeValidator.isValid])],
            newPassword: ['', Validators.compose([Validators.required, PasswordValidator.isValid,
                PasswordValidator.newPasswordsMatch])],
            confirmPassword: ['', Validators.compose([Validators.required, PasswordValidator.isValid,
                PasswordValidator.confirmPasswordsMatch])]
        });
    }

    ngOnInit() {
    }

    onSubmitForgotPassword() {

        if (!this.forgotPasswordForm.valid) {
            console.log('not valid');
            return;
        }

        const userName = this.forgotPasswordForm.value.username;
        this.authService.forgotPassword(userName).then(
            res => {
                this.promptSent = !this.promptSent;
                this.showVerificationDetailsAlert(res);
            },
            err => {
                this.showErrorMessage(err.message);
            }
        );

    }

    onSubmitResetPassword() {

        if (!this.resetPasswordForm.valid) {
            console.log('not valid');
            return;
        }

        // TODO add verification for passwords etc
        const userName = this.forgotPasswordForm.value.username;
        const verificationCode = this.resetPasswordForm.value.verificationCode.toString();
        const password = this.resetPasswordForm.value.newPassword;

        this.authService.confirmPassword(userName, verificationCode, password).then(
            res => {
                this.authenticate(userName, password)
            },
            err => {
                console.log(err);
            }
        )

    }

    authenticate(username: string, password: string) {
        this.isLoading = true;
        this.loadingCtrl.create({
            keyboardClose: true, message: 'Logging in....'
        }).then(loadingEl => {
            loadingEl.present();
            this.authService.authenticateWithAWS(username, password)
                .then(res => {
                    this.isLoading = false;
                    loadingEl.dismiss();
                    this.router.navigateByUrl('/home');
                }, err => {
                    this.isLoading = false;
                    loadingEl.dismiss();
                    console.log(err);
                });
        });
    }

    showVerificationDetailsAlert(data: any) {
        const alert = this.alertCtrl.create({
            header: 'Verification sent',
            message: 'You should receive an email with a verification code at ' + data.CodeDeliveryDetails.Destination +
                '.  Enter that code here along with a new password.',
            buttons: [
                {
                    text: 'OK',
                    role: 'cancel'
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }


    showErrorMessage(message: string) {
        const alert = this.alertCtrl.create({
            header: 'An error occurred',
            message: message,
            buttons: [
                {
                    text: 'OK',
                    role: 'cancel'
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

}
