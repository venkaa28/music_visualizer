import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../../environments/environment";
import {NotifierModule} from "angular-notifier";

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
    expect(true).toBe(false);
  });

  it('test signUpUser()', () => {
    expect(true).toBe(false);
  });

  it('test resetPassword()', () => {
    expect(true).toBe(false);
  });

  it('test logOutUser()', () => {
    expect(true).toBe(false);
  });

  it('test getUser()', () => {
    expect(true).toBe(false);
  });

  it('test getLoggedIn()', () => {
    expect(true).toBe(false);
  });

});
