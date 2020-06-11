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
import {Subscription} from "rxjs";

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
    imageChanged = false;
    formEdited = false;

    private imageDataSub: Subscription;

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

        this.imageDataSub = this.imagePickerService.imageData.subscribe(image => {
            if (image) {
                this.profileURL = image;
                this.imageChanged = true;
                this.formEdited = true;
            }
        })
    }

    getProfile() {
        this.isLoading = true;
        this.profileService.getUserProfile(this.username)
            .subscribe(profile => {
                this.userProfile = profile;
                this.isLoading = false;
                this.getSignedURL(this.userProfile.picture);
                this.profileForm = this.formBuilder.group({
                    username: [this.userProfile.username],
                    name: [this.userProfile.name],
                    email: [this.userProfile.email],
                    created: [this.userProfile.createdAt],
                    password: ['', Validators.compose([Validators.required, PasswordValidator.isValid])],
                    image: [this.userProfile.picture]
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
                        this.profileForm.patchValue({name: data.name});
                        this.formEdited = true;
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    save() {
        if (this.imageChanged) {
            this.uploadPhoto(this.profileURL.replace('data:image/jpeg;base64,', ''));
        } else {
            this.saveProfile();
        }
    }

    saveProfile() {
        const loading = this.alertController.create({
            header: 'Wait',
            message: 'Saving profile...'
        }).then(loadingEl => {
            loadingEl.present();

            this.profileService.updateUserProfile(this.userProfile)
                .subscribe(result => {
                    this.formEdited = false;
                    this.imageChanged = false;
                    loadingEl.dismiss();
                }, error => {
                    this.errorService.showErrorMessage('Error saving profile', error.message, null);
                    loadingEl.dismiss();
                })
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

    uploadPhoto(imageFile: any) {
        const loading = this.alertController.create({
            header: 'Wait',
            message: 'Uploading...'
        }).then(loadingEl => {
            loadingEl.present();

            this.authService
                .getLoggedOnUserToken()
                .then(userToken => {
                    this.s3Service.upload(imageFile, userToken).then(
                        (res: string) => {
                            loadingEl.dismiss();
                            this.profileForm.patchValue({image: imageFile});
                            this.userProfile.picture = res;
                            this.saveProfile();
                        },
                        err => {
                            loadingEl.dismiss();
                            this.errorService.showErrorMessage("Error in image upload!", err.message);
                            console.log(err);
                        }
                    );
                })
                .catch(err => console.log(err));
        });
    }

    getSignedURL(imageId: string) {
        this.authService
            .getLoggedOnUserToken()
            .then(userToken => {
                this.s3Service.getSignedURL(imageId, userToken).then(
                    res => {
                        console.log(res);
                        this.profileURL = res;
                    },
                    err => {
                        this.errorService.showErrorMessage("Error displaying image", err.message, err.code);
                        console.log(err);
                    }
                );
            })
            .catch(err => console.log(err));
    }

    onNewImage() {
        this.imagePickerService.onPickImage();
    }

}
