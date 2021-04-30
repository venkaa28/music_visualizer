import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { LoginPageComponent } from './login-page.component';
import {AngularFireModule} from "@angular/fire";
import { firebaseConfig } from '../../../environments/environment';
import {NotifierModule} from "angular-notifier";
import {browser} from "protractor";
import {any} from "codelyzer/util/function";

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        // BrowserModule,
        AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        NotifierModule,
      ],
      declarations: [ LoginPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jasmine.clock().uninstall();
    jasmine.clock().install();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test getEmailMessage() with invalid email', () => {
    //an invalid email
    component.loginForm.controls.email.setValue('randomEmail');
    var ret = component.getEmailMessage();
    expect(ret).toEqual('Not a valid email');
  });

  it('form invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('test passwordMessage() with short password', () => {
    // an empty password
    component.loginForm.controls.password.setValue('123');
    var ret = component.getPasswordMessage();
    expect(ret).toEqual(`Passwords must be at least ${component.minLength} characters long`);
    //expect(true).toBe(false);
  });


  it('test login()', () => {
    component.loginForm.controls['email'].setValue("b@b.bbb");
    component.loginForm.controls['password'].setValue("bbbbbb");
    expect(component.loginForm.valid).toBeTruthy();

  })

});
