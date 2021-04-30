import { TestBed } from '@angular/core/testing';

import { LoggedInGuard } from './logged-in.guard';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import { firebaseConfig } from '../../environments/environment';
import {NotifierModule} from "angular-notifier";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, ɵangular_packages_router_router_n } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserAuthGuard } from './user-auth.guard';

describe('LoggedInGuard', () => {
  let guard: UserAuthGuard;
  let routerSpy: jasmine.SpyObj<Router>;
  let serviceStub: Partial<AuthService>;
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
    routerSpy = (jasmine.createSpyObj<Router>('Router', ['navigate']) as jasmine.SpyObj<Router>); // [1]
    serviceStub = {}; // [2]
    guard = new UserAuthGuard(serviceStub as AuthService, routerSpy);
    
  });
  

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it("test canActivate()", () => {
    routerSpy[0].url = 'https://localhost:4200/VisualizationPage';
    expect(guard.canActivate(new ActivatedRouteSnapshot(), routerSpy[0])).toBeInstanceOf(UrlTree);
  });
});
