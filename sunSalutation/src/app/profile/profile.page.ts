import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {HomeService} from "../home/home.service";
import {ProfileService} from "./profile.service";
import {UserProfile} from "../models/UserProfile";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userName: string;
  userProfile: UserProfile;

  constructor(private authService: AuthService,
              private profileService: ProfileService) { }

  ngOnInit() {
    this.authService.getCurrentUser()
        .subscribe(user => {
          console.log(user);
          this.userName = user.username;
          this.getProfile();
        });
  }

  getProfile() {
    this.profileService.getUserProfile(this.userName)
        .subscribe(profile => {
          console.log(profile);
          this.userProfile = profile;
        })
  }

}
