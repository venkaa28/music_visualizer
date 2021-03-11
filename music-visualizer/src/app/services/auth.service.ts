import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';

import firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireDatabase} from '@angular/fire/database';

import {User} from '../classes/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: User;
  constructor(public ngFireAuth: AngularFireAuth, public afStore: AngularFirestore, public router: Router, public ngZone: NgZone,
              public afDB: AngularFireDatabase) {
    this.userData = new User();
  }
  loginUser(
    email: string,
    password: string
  ) {
    return this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  signUpUser(
    email: string,
    password: string
  ) {
    return this.ngFireAuth.createUserWithEmailAndPassword(email, password);
  }

  resetPassword(email: string) {
    return this.ngFireAuth.sendPasswordResetEmail(email);
  }

  logOutUser(): Promise<void>{
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

}
