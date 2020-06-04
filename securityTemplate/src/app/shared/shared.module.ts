import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ErrorComponent} from "./error/error.component";
import {IonicModule} from "@ionic/angular";


@NgModule({
    declarations: [ErrorComponent],
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [ErrorComponent]
})
export class SharedModule {
}
