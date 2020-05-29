import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {ProfileService} from "./profile.service";
import {UserProfile} from "../models/UserProfile";
import {FormGroup} from "@angular/forms";
import {AlertController} from "@ionic/angular";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    userName: string;
    userProfile: UserProfile;
    isLoading = false;
    form: FormGroup;

    constructor(private authService: AuthService,
                private profileService: ProfileService,
                private alertController: AlertController) {
    }

    ngOnInit() {
        this.authService.getCurrentUser()
            .subscribe(user => {
                this.userName = user.username;
                this.getProfile();
            });
    }

    getProfile() {
        this.isLoading = true;
        this.profileService.getUserProfile(this.userName)
            .subscribe(profile => {
                this.userProfile = profile;
                this.isLoading = false;
            })
    }

    editName() {
        const alert = this.alertController.create({
            header: 'Enter name',
            inputs: [
                {
                    name: 'name',
                    placeholder: 'Name',
                    value: this.userProfile.name
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: data => {
                        this.userProfile.name = data.name;
                        this.saveProfile();
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    saveProfile() {
        this.profileService.updateUserProfile(this.userProfile)
            .subscribe(result => {
                console.log('success');
            })
    }

}
