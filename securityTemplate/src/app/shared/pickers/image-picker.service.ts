import { Injectable } from '@angular/core';
import {CameraResultType, CameraSource, Capacitor, Plugins} from "@capacitor/core";
import {Platform} from "@ionic/angular";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImagePickerService {
  private _imageData = new BehaviorSubject<string>('');

  fileInput = document.createElement('input');
  usePicker = false;

  constructor(private platform: Platform) {
    this.fileInput.type = 'file';
    this.fileInput.accept= 'image/jpeg';
    this.fileInput.addEventListener('change', (event: Event) => {
      this.onFileChosen(event); // Error: files does not exist on EventTarget.
    });

    console.log('Mobile:', this.platform.is('mobile'));
    console.log('Hybrid:', this.platform.is('hybrid'));
    console.log('ios:', this.platform.is('ios'));
    console.log('android:', this.platform.is('android'));
    console.log('Desktop:', this.platform.is('desktop'));

    if ((this.platform.is('mobile') && !this.platform.is('hybrid'))
        || this.platform.is('desktop')) {
      this.usePicker = true;
    }
  }

  get imageData() {
    return this._imageData.asObservable();
  }

  public base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = window.atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  onPickImage() {
      if (!Capacitor.isPluginAvailable('Camera')) {
        this.fileInput.click();
        return;
      }

      Plugins.Camera.getPhoto({
        quality: 50,
        source: CameraSource.Prompt,
        correctOrientation: true,
        width: 600,
        resultType: CameraResultType.Base64
      }).then(image => {
        this._imageData.next('data:image/jpeg;base64,' + image.base64String);
      }).catch(error => {
        if (this.usePicker) {
          this.fileInput.click();
        }
      });
  }

  onFileChosen(event: Event) {
      const pickedFile = (event.target as HTMLInputElement).files[0];
      if (!pickedFile) {
        return;
      }

      const fr = new FileReader();
      fr.onload = () => {
        const dataUrl = fr.result.toString();
        this._imageData.next(dataUrl);
      }
      fr.readAsDataURL(pickedFile);
  }
}
