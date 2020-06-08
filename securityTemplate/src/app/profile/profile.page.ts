import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {ProfileService} from "./profile.service";
import {UserProfile} from "../models/UserProfile";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertController, LoadingController} from "@ionic/angular";
import {Router} from "@angular/router";
import {PasswordValidator} from "../validators/password";
import {ErrorService} from "../shared/error/error.service";
import {ImagePickerService} from "../shared/pickers/image-picker.service";
import {S3Service} from "../shared/s3/s3.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    username: string;
    userProfile: UserProfile;
    isLoading = false;
    profileForm: FormGroup;
    deleteRequested = false;
    profileURL: any;

    constructor(private authService: AuthService,
                private profileService: ProfileService,
                private alertController: AlertController,
                private router: Router,
                private formBuilder: FormBuilder,
                private errorService: ErrorService,
                private imagePickerService: ImagePickerService,
                private s3Service: S3Service) {
    }

    ngOnInit() {
        this.authService.getCurrentUser()
            .subscribe(user => {
                this.username = user.username;
                this.getProfile();
            });

        this.getSignedURL();
    }

    getProfile() {
        this.isLoading = true;
        this.profileService.getUserProfile(this.username)
            .subscribe(profile => {
                this.userProfile = profile;
                this.isLoading = false;
                this.profileForm = this.formBuilder.group({
                    username: [this.userProfile.username],
                    name: [this.userProfile.name],
                    email: [this.userProfile.email],
                    created: [this.userProfile.createdAt],
                    password: ['', Validators.compose([Validators.required, PasswordValidator.isValid])],
                    image: []
                });
            })
    }

    editName() {
        const alert = this.alertController.create({
            header: 'Edit name',
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

    // TODO add an email validation to delete account?
    onDelete() {
        if (this.deleteRequested) {
            this.deleteProfile();
            return;
        }
        const alert = this.alertController.create({
            header: 'Delete account',
            message: 'Are you sure you want to delete your account?  This cannot be undone',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Ok',
                    handler: data => {
                        this.deleteRequested = true;
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    deleteProfile() {
        const username = this.userProfile.username;
        this.profileService.deleteUserProfile(username)
            .subscribe(result => {
                this.authService.deleteUserProfile(username, this.profileForm.value.password).then(
                    res => {
                        this.deleteRequested = false;
                        this.router.navigateByUrl('/auth');
                    },
                    err => {
                        this.deleteRequested = false;
                        this.profileForm.value.password = '';
                        this.errorService.showErrorMessage('Unable to delete profile', err.message, err.code);
                    });
            })

    }

    onCancelDelete() {
        this.deleteRequested = false;
    }

    onImagePicked(imageData: string | File) {
        let imageFile;
        console.log(typeof imageData);
        if (typeof imageData === 'string') {
            try {
                imageFile = imageData.replace('data:image/jpeg;base64,', '');
            } catch (error) {
                console.log(error);
                return;
            }
        } else {
            imageFile = imageData;
        }

        this.profileForm.patchValue({image: imageFile});
        this.uploadPhoto(imageFile);
    }

    uploadPhoto(imageFile: any) {
        const loading = this.alertController.create({
            header: 'Wait',
            message: 'Uploading...'
        }).then(loadingEl => {
            loadingEl.present();

            this.authService
                .getLoggedOnUserToken()
                .then(userToken => {
                    this.s3Service.upload(imageFile, 'profilePhoto', userToken).then(
                        res => {
                            loadingEl.dismiss();
                            alert("Image uploaded!");
                        },
                        err => {
                            loadingEl.dismiss();
                            alert("Error in image upload!");
                            console.log(err);
                        }
                    );
                })
                .catch(err => console.log(err));
        });
    }

    getSignedURL() {
        this.authService
            .getLoggedOnUserToken()
            .then(userToken => {
                this.s3Service.getSignedURL('2763a044-fdd7-403b-b528-26ec473131b6', userToken).then(
                    res => {
                        console.log(res);
                        this.profileURL = res;
                    },
                    err => {
                        alert("Error in image url!");
                        console.log(err);
                    }
                );
            })
            .catch(err => console.log(err));
    }

}
