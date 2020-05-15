import { Component, OnInit } from '@angular/core';
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
              private alertController: AlertController) { }

  ngOnInit() {
  }

  authenticate(username: string, password: string, professional: boolean) {
    this.isLoading = true;
    this.authService.login();
    this.loadingCtrl.create({
      keyboardClose: true, message: 'Logging in....'
    }).then(loadingEl => {
      loadingEl.present();
      this.authService.authenticate(username, password)
          .then(res => {
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigateByUrl('/home');
            console.log(res);
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
    console.log('here');
    if (!form.valid) {
      console.log('not valid');
      return;
    }

    const email = form.value.email;
    const password = form.value.password;
    const username = form.value.username;
    console.log(email, password);

    if (this.isLogin) {
      this.authenticate(username, password, true);
    } else {
      console.log('signing up');
      this.authService.signUp(username, email, password).then(
          res => {
            console.log(res);
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
            console.log('Cancel clicked');
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
          console.log(res);
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
          console.log(res);
          this.promptVerificationCode(username, pw);
        },
        err => {
          console.log(err);
        }
    );
  }
}
