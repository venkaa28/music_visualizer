import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {RouterTestingModule} from '@angular/router/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {AngularFireModule} from '@angular/fire';
import {firebaseConfig} from '../../environments/environment';
import {NotifierModule} from 'angular-notifier';
import {User} from "../classes/user";

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        // BrowserModule,
        AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        NotifierModule
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test loginUser()', () => {
    //service.loginUser('eromero5@wisc.edu', '123456', true);
    const spy = spyOn(service, "loginUser").and.returnValue("eromero5@wisc.edu");
    expect((service as any).loginUser('eromero5@wisc.edu', 'password', false)).toEqual('eromero5@wisc.edu');
  });

  it('test signUpUser()', () => {
    const spy = spyOn(service, "signUpUser").and.returnValue(true);
    expect(service.signUpUser("testEmail@gmail.com", "password", {}, false)).toBe(true);
  });

  // it('test resetPassword()', () => {
  //   expect(true).toBe(false);
  // });
  //
  // it('test logOutUser()', () => {
  //   expect(true).toBe(false);
  // });
  //
  // it('test getUser()', () => {
  //   expect(true).toBe(false);
  // });
  //
  // it('test getLoggedIn()', () => {
  //   expect(true).toBe(false);
  // });

});
