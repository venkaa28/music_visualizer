// angular
import {Injectable} from '@angular/core';

// firebase
import firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';

// General libraries
import { CookieService } from 'ngx-cookie-service';

// Local libs
import {User} from '../classes/user';


// typedef dict
type Dict = {[key: string]: any};


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userData: User; // global user var

  constructor(public ngFireAuth: AngularFireAuth, private cookieService: CookieService) {
    this.userData = new User(); // init to blank user
  }

  // log the user into firebase, store data as a cookie
  async loginUser(email: string, password: string): Promise<void> {
    // sign into auth service
    await this.ngFireAuth.signInWithEmailAndPassword(email, password).catch((error) => {
      console.log(error); // log the error
      this.cookieService.deleteAll(); // clear cookies
      throw error; // allow caller to handle the error
    })

    const uid = email.replace(/[@.]/g, '_'); // get id string to access account info from rtdb
    var userDict: Dict = {}; // used to store user data from firebase

    return new Promise(async (resolve, reject) => {
      // Get stored user data from realtime database
      await firebase.database().ref('accounts/' + uid).on('value', async (snapshot) => {
        // make sure account exists
        if (snapshot.exists()) {
          userDict.email = snapshot.val().email; // grab email
          userDict.name = snapshot.val().name; // grab user's name
          
          // convert json dict to string and set as account cookie
          this.cookieService.set('account', JSON.stringify(userDict));
          
          resolve();
        } else {
          reject(new Error('Bad login'));
        }
      });
    });
  }

  // sign up the user and add account to firebase
  async signUpUser(email: string, password: string, userDict: Dict): Promise<void> {
    // create user account in fire auth
    await this.ngFireAuth.createUserWithEmailAndPassword(email, password).catch((error) => {
      console.log(error);
      // if there's an error clear all cookies
      this.cookieService.deleteAll();
      throw error;
    })

    // generate uid for user in rtdb
    const uid = email.replace(/[@.]/g, '_');

    return new Promise(async (resolve, reject) => {
      // store user data in rtdb
      await firebase.database().ref('accounts').child(uid).set(userDict);

      // convert data to json string and store it as a cookie
      this.cookieService.set('account', JSON.stringify(userDict));

      resolve();
    });
  }

  // reser user's password with a reset email
  resetPassword(email: string) {
    return this.ngFireAuth.sendPasswordResetEmail(email);
  }

  // clear cookies and sign out of auth
  logOutUser(): Promise<void>{
    // clear cookies
    this.cookieService.deleteAll();
    // sign out from fire auth
    return this.ngFireAuth.signOut();
  }

  // get user data from cookie if it exists, allows for persistent log in
  getUser(){
    const cookie: string = this.cookieService.get('account'); // get account cookie

    // make sure cookie exists
    this.userData = (cookie.length === 0) ? null : JSON.parse(cookie);

    // store in global user object
    return this.userData;
  }

  // use cookies to see if user is logged in
  getLoggedIn() {
    return (this.getUser() === null) ? false : true;
  }
}
