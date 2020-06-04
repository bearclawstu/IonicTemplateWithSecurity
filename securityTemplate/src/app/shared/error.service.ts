import { Injectable } from '@angular/core';
import {AlertController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private alertCtrl: AlertController) { }

  showErrorMessage(header: string, message: string, code?: string) {
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
}
