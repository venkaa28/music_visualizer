import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import {AuthService} from '../services/auth.service'

@Injectable({
  providedIn: 'root'
})
export class UserAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean|UrlTree {
      const url: string = state.url;

      return this.checkLogin(url);
  }
  
  private checkLogin(url: string): true|UrlTree {
    if (this.authService.getLoggedIn()) { return true; }

    // Redirect to the login page
    return this.router.parseUrl('LoginPage');
  }
}
