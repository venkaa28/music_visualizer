import { TestBed } from '@angular/core/testing';

import { UserAuthGuard } from './user-auth.guard';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../../environments/environment";
import {NotifierModule} from "angular-notifier";

describe('UserAuthGuard', () => {
  let guard: UserAuthGuard;

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
    guard = TestBed.inject(UserAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
