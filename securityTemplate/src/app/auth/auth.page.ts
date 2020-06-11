import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {PasswordValidator} from "../validators/password";
import {ErrorService} from "../shared/error/error.service";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
    isLoading = false;
    isLogin = true;
    signInForm: FormGroup;
    signUpForm: FormGroup;

    constructor(private authService: AuthService,
                private router: Router,
                private loadingCtrl: LoadingController,
                private alertController: AlertController,
                private formBuilder: FormBuilder,
                private errorService: ErrorService) {
    }

    ngOnInit() {
        this.signInForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.compose([Validators.required, PasswordValidator.isValid])]
        });

        this.signUpForm = this.formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            username: ['', Validators.required],
            newPassword: ['', Validators.compose([Validators.required, PasswordValidator.isValid,
                PasswordValidator.newPasswordsMatch])],
            confirmPassword: ['', Validators.compose([Validators.required, PasswordValidator.isValid,
                PasswordValidator.confirmPasswordsMatch])]
        });
    }

    ionViewWillEnter() {
        this.signUpForm.reset();
        this.signInForm.reset();
        this.isLogin = true;
    }

    onSignIn() {
        if (!this.signInForm.valid) {
            return;
        }

        const password = this.signInForm.value.password;
        const username = this.signInForm.value.username;

        this.authenticate(username, password, true);
    }

    authenticate(username: string, password: string, professional: boolean) {
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
                    if (err.code === 'UserNotConfirmedException') {
                        this.promptVerificationCode(username, password);
                    }
                });
        });
    }

    onSignUp() {
        if (!this.signUpForm.valid) {
            return;
        }

        const email = this.signUpForm.value.email;
        const password = this.signUpForm.value.newPassword;
        const username = this.signUpForm.value.username;

        this.authService.signUp(username, email, password).then(
            res => {
                this.promptVerificationCode(username, password);
            },
            err => {
                this.errorService.showErrorMessage('An error occurred', err.message, err.code);
            }
        );

    }

    onSwitchAuthMode() {
        this.isLogin = !this.isLogin;
    }

    onForgotPassword() {
        this.router.navigateByUrl('/forgot-password');
    }

    promptVerificationCode(username: string, pw: string) {
        const alert = this.alertController.create({
            header: 'Enter Verfication Code',
            inputs: [
                {
                    name: 'VerificationCode',
                    placeholder: 'Verification Code'
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: data => {
                    }
                },
                {
                    text: 'Verify',
                    handler: data => {
                        this.verifyUser(data.VerificationCode, username, pw);
                    }
                },
                {
                    text: 'Resend',
                    handler: data => {
                        this.resendVerificationCode(username, pw);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    verifyUser(verificationCode: string, username: string, pw: string) {
        this.authService.confirmUser(verificationCode, username).then(
            res => {
                this.authenticate(username, pw, true);
            },
            err => {
                this.errorService.showErrorMessage('An error occurred', err.message, err.code);
            }
        );
    }

    resendVerificationCode(username: string, pw: string) {
        this.authService.resendVerificationCode(username).then(
            res => {
                this.promptVerificationCode(username, pw);
            },
            err => {
                this.errorService.showErrorMessage('An error occurred', err.message, err.code);
            }
        );
    }
}
