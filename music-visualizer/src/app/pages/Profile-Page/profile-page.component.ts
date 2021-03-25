import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {User} from '../../classes/user';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service'

type Dict = {[key: string]: any};

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['../../../assets/bootstrap/css/bootstrap.min.css']
})
export class ProfilePageComponent implements OnInit {
  title = 'Profile test';
  public userData: User;

  constructor(public router: Router, private authService: AuthService) { 
    this.userData = this.authService.getUser();
  }

  ngOnInit(): void {
    
  }

  async logout() {
    await this.authService.logOutUser();
    await this.router.navigate(['../']);
  }
}
