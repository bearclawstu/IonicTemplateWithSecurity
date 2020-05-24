import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  promptSent = false;
  isLoading = false;

  constructor(private authService: AuthService,
              private router: Router,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      console.log('not valid');
      return;
    }

    // TODO add verification for passwords etc
    const userName = form.value.userName;
    const verificationCode = form.value.verificationCode;
    const password = form.value.password;
    const confirmPassword = form.value.confPassword;

    console.log(form);

    if (!this.promptSent) {
      this.authService.forgotPassword(userName).then(
          res => {
            this.promptSent = !this.promptSent;
            this.showVerificationDetailsAlert(res);
            console.log(res);
          },
          err => {
            console.log(err);
            this.showErrorMessage(err.message);
          }
      );
    } else {
      this.authService.confirmPassword(userName, verificationCode, password).then(
          res => {
            console.log("success");
            this.authenticate(userName, password)
          },
          err => {
            console.log(err);
          }
      )
    }
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
                    console.log(res);
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
                    role: 'cancel',
                    handler: data => {
                        console.log('alert dismissed');
                    }
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
                    role: 'cancel',
                    handler: data => {
                        console.log('alert dismissed');
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

}
