import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';

import firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireDatabase} from '@angular/fire/database';

import {User} from '../classes/user';
import { CookieService } from 'ngx-cookie-service';

type Dict = {[key: string]: any};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userData: User;

  constructor(public ngFireAuth: AngularFireAuth, public afStore: AngularFirestore, public router: Router, public ngZone: NgZone,
              public afDB: AngularFireDatabase, private cookieService: CookieService) {
    this.userData = new User();
  }

  async loginUser(email: string, password: string): Promise<void> {
    await this.ngFireAuth.signInWithEmailAndPassword(email, password).catch((error) => {
      console.log(error);  
      this.cookieService.deleteAll();
      throw error;
    })

    const uid = email.replace(/[@.]/g, '_');
    var userDict: Dict = {};

    return new Promise(async (resolve, reject) => {
      await firebase.database().ref('accounts/' + uid).on('value', async (snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          userDict['email'] = snapshot.val().email;
          userDict['name'] = snapshot.val().name;
          var userJSON: string = JSON.stringify(userDict);
          this.cookieService.set('account', userJSON);
          resolve();
        } else {
          reject(new Error('Bad login'));
        }
      });
    });
  }

  async signUpUser(email: string, password: string, userDict: {[key: string]: any;}): Promise<void> {
    await this.ngFireAuth.createUserWithEmailAndPassword(email, password).catch((error) => {
      console.log(error);
      this.cookieService.deleteAll();
      return;
    });

    const uid = email.replace(/[@.]/g, '_');

    return new Promise(async (resolve, reject) => {
      await firebase.database().ref('accounts').child(uid).set(userDict);
      
      var userJSON: string = JSON.stringify(userDict);
      this.cookieService.set('account', userJSON);
      resolve();
    });
  }

  resetPassword(email: string) {
    return this.ngFireAuth.sendPasswordResetEmail(email);
  }

  logOutUser(): Promise<void>{
    this.cookieService.deleteAll();
    return this.ngFireAuth.signOut();
  }

  getUser(){
    const cookie: string = this.cookieService.get('account');
    var userJSON;
    
    if (cookie.length === 0) {
      userJSON = null;
    } else {
      userJSON = JSON.parse(cookie);
    }

    this.userData = userJSON;
    return this.userData;
  }

  getLoggedIn() {
    var userData = this.getUser();
    console.log(userData);

    if (userData === null) {
      return false;
    }

    return true;
  }
}
