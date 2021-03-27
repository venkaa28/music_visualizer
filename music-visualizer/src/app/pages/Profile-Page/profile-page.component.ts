import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../../classes/user';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';
import {SpotifyService} from "../../services/spotify.service";


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

  constructor(public router: Router, private authService: AuthService, private cookieService: CookieService, private spotifyService: SpotifyService) {
    this.userData = this.authService.getUser();
  }

  ngOnInit(): void {
    this.getUserData();
  }

  async logout() {
    await this.authService.logOutUser();
    await this.router.navigate(['../']);
  }

  async goBackToVisualPage() {
    await this.router.navigate(['../../VisualizationPage']);
  }

  async authorizeSpotify() {
    this.spotifyService.getAuth();
  }
}
