import { Injectable } from '@angular/core';
import {AlertController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private alertCtrl: AlertController) { }

  showErrorMessage(header: string, message: string, code?: string) {
    if (code) {
      message = this.setMessageFromCode(code, message);
    }
    const alert = this.alertCtrl.create({
      header: header,
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

  private setMessageFromCode(code: string, message: string) {
    switch(code) {
      case 'CredentialsError': {
        return 'Invalid credentials';
      }
      default: {
        return message;
      }
    }
  }
}
