import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {AlertController, LoadingController} from '@ionic/angular';
import {NgForm} from '@angular/forms';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
    isLoading = false;
    isLogin = true;

    constructor(private authService: AuthService,
                private router: Router,
                private loadingCtrl: LoadingController,
                private alertController: AlertController) {
    }

    ngOnInit() {
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
                    console.log(err);
                });
        });
    }

    onSubmit(form: NgForm) {
        if (!form.valid) {
            console.log('not valid');
            return;
        }

        const email = form.value.email;
        const password = form.value.password;
        const username = form.value.username;

        if (this.isLogin) {
            this.authenticate(username, password, true);
        } else {
            this.authService.signUp(username, email, password).then(
                res => {
                    this.promptVerificationCode(username, password);
                },
                err => {
                    console.log(err);
                }
            );
        }
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
                alert(err.message);
            }
        );
    }

    resendVerificationCode(username: string, pw: string) {
        this.authService.resendVerificationCode(username).then(
            res => {
                this.promptVerificationCode(username, pw);
            },
            err => {
                console.log(err);
            }
        );
    }
}
