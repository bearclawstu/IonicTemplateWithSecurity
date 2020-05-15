import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {HomeService} from "./home.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  personalCount = 0;
  totalCount = 80;
  userName: string;

  constructor(private authService: AuthService,
              private homeService: HomeService) {}

  ngOnInit() {
    this.authService.getCurrentUser()
        .subscribe(user => {
          console.log(user);
          this.userName = user.username;
        });
  }

  add(count: number) {
    this.personalCount += count;
    this.totalCount += count;
  }

}
