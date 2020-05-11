import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  personalCount = 0;
  totalCount = 80;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getCurrentUser()
        .subscribe(user => {
          console.log(user);
        });
  }

  ionViewWillEnter() {
    // this.menuCtrl.enable(true, 'mainMenu');
  }

  add(count: number) {
    this.personalCount += count;
    this.totalCount += count;
  }

}
