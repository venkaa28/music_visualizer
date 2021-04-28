import { TestBed } from '@angular/core/testing';

import { UserAuthGuard } from './user-auth.guard';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import { firebaseConfig } from '../../environments/environment';
import {NotifierModule} from "angular-notifier";
import { ActivatedRouteSnapshot, RouterStateSnapshot, ɵangular_packages_router_router_n } from '@angular/router';

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

  it("test canActivate()", () => {
    // sketchy, not sure if this will do what I expect
    var state = new RouterStateSnapshot(new ɵangular_packages_router_router_n<ActivatedRouteSnapshot>(new ActivatedRouteSnapshot(), null));
    state.url = 'https://localhost:4200/VisualizationPage';
    expect(guard.canActivate(new ActivatedRouteSnapshot(), state)).toBe(false);
  })
});
