import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';

import firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireDatabase} from '@angular/fire/database';

import {User} from '../classes/user';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: User;
  private loggedIn: boolean = false;
  constructor(public ngFireAuth: AngularFireAuth, public afStore: AngularFirestore, public router: Router, public ngZone: NgZone,
              public afDB: AngularFireDatabase, private cookieService: CookieService) {
    this.userData = new User();
  }
  loginUser(
    email: string,
    password: string
  ) {
    this.loggedIn = true;
    this.cookieService.set('email', email);
    this.cookieService.set('password', password);
    return this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  signUpUser(
    email: string,
    password: string
  ) {
    this.loggedIn = true;
    this.cookieService.set('email', email);
    this.cookieService.set('password', password);
    return this.ngFireAuth.createUserWithEmailAndPassword(email, password);
  }

  resetPassword(email: string) {
    return this.ngFireAuth.sendPasswordResetEmail(email);
  }

  logOutUser(): Promise<void>{
    this.loggedIn = false;
    this.cookieService.deleteAll();
    return this.ngFireAuth.signOut();
  }

  async getUserData(uid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      firebase.database().ref('accounts/' + uid).on('value', async (snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          this.userData.email = snapshot.val().email;
          this.userData.name = snapshot.val().name;
          // Todo: get user's orders and add to list of current/previous orders
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  getUser(){
    return this.userData;
  }

  getLoggedIn() {
    if (!this.loggedIn) {
      const un: string = this.cookieService.get('email');
      const pw: string = this.cookieService.get('password');

      if (un.length !== 0) {
        this.loginUser(un, pw).catch((error) => {
          console.log(error);
          return false;
        });

        this.loggedIn = true;
      }

      console.log(this.cookieService.get('username'));
      console.log(this.cookieService.get('username').length);
      console.log(this.cookieService.get('password'));
      console.log(this.ngFireAuth.currentUser);

    }

    return this.loggedIn;
  }
}
