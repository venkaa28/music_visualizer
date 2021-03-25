import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../../classes/user';
import { CookieService } from 'ngx-cookie-service';

type Dict = {[key: string]: any};

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['../../../assets/bootstrap/css/bootstrap.min.css']
})
export class ProfilePageComponent implements OnInit {
  title = 'Profile test';
  public userData: User;

  constructor(public router: Router, private cookieService: CookieService) {
    this.userData = new User();
  }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserCookie() {
    return this.cookieService.get('account');
  }

  getUserData(): void {
    const cookie = this.cookieService.get('account');
    if (cookie !== '') {
      const rawJSON = JSON.parse(cookie);
      this.userData.email = rawJSON.email;
      this.userData.name = rawJSON.name;
    }
  }
}
