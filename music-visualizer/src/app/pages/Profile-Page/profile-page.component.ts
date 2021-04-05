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
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  title = 'Profile test';
  public userData: User;
  // Temporary variable for determining whether or not Spotify is linked
  // until we get the api hooked up
  public spotifyLinked: boolean;


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

  getSpotifyLinked(): boolean {
    return false;
  }

  constructor(public router: Router, private authService: AuthService, private cookieService: CookieService,
    private readonly notifierService: NotifierService) {
    this.userData = this.authService.getUser();
  }

  ngOnInit(): void {
    this.getUserData();
    this.spotifyLinked = false;
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
    // TODO should this log the user out afterwards? 
    // I've seen services do this. It'd be super easy to just wait
    // a couple seconds then kick the user back to the homepage so they
    // need to log in again. Something to think about.
  }

  async logout() {
    await this.authService.logOutUser();
    await this.router.navigate(['../']);
  }

  async goBackToVisualPage() {
    await this.router.navigate(['../../VisualizationPage']);
  }
}
