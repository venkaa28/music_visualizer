import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../../classes/user';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service'
import {NotifierService} from 'angular-notifier';

type Dict = {[key: string]: any};

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['../../../assets/bootstrap/css/bootstrap.min.css']
})
export class ProfilePageComponent implements OnInit {
  title = 'Profile test';
  public userData: User;


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

  constructor(public router: Router, private authService: AuthService, private cookieService: CookieService,
    private readonly notifierService: NotifierService) {
    this.userData = this.authService.getUser();
  }

  ngOnInit(): void {
    this.getUserData();
  }

  async passwordReset(): Promise<void> {
    // request reset password email
    try {
      const res = await this.authService.resetPassword(this.userData.email);
      console.log(res);
      this.notifierService.notify('success', 'Email has been sent!');
    } catch (error) {
      console.log(error);
      this.notifierService.notify('error', 'Whoops, looks like something went wrong!');
    }
  }

  async logout() {
    await this.authService.logOutUser();
    await this.router.navigate(['../']);
  }

  async goBackToVisualPage() {
    await this.router.navigate(['../../VisualizationPage']);
  }
}
