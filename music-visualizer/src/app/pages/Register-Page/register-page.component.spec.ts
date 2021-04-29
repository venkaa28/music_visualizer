import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPageComponent } from './register-page.component';

import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../../../environments/environment";
import {NotifierModule} from "angular-notifier";

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;

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
        NotifierModule
      ],
      declarations: [ RegisterPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test getEmailMessage() with empty email', () => {
    // an invalid email
    component.signUpForm.controls.email.setValue('');
    var ret = component.getEmailMessage();
    expect(ret).toEqual('Not a valid email');
  });

  it('test getEmailMessage() with vaild email', () => {
    // a valid email
    component.signUpForm.controls.email.setValue('b@b.bbb');
    var ret = component.getEmailMessage();
    expect(ret).toEqual('');
  });

  it('test passwordMessage() with empty password', () => {
    component.signUpForm.controls.password.setValue('');
    var ret = component.getPasswordMessage();
    expect(ret).toEqual(`Passwords must be at least ${component.minLength} characters long`);
  });

  it('test passwordMessage() with short password', () => {
    component.signUpForm.controls.password.setValue('123');
    var ret = component.getPasswordMessage();
    expect(ret).toEqual(`Passwords must be at least ${component.minLength} characters long`);
  });

  it('test passwordMessage() with valid password', () => {
    component.signUpForm.controls.password.setValue('123456');
    var ret = component.getPasswordMessage();
    expect(ret).toEqual('');
  });

  it('test getVerifyPasswordMessage() with matched password', () => {
    component.signUpForm.controls.password.setValue('123456');
    component.signUpForm.controls.verifyPassword.setValue('123456');
    var ret = component.getVerifyPasswordMessage();
    expect(ret).toEqual('');
  });

  it('test getVerifyPasswordMessage() with unmatched password', () => {
    component.signUpForm.controls.password.setValue('123456');
    component.signUpForm.controls.verifyPassword.setValue('12345');
    var ret = component.getPasswordMessage();
    expect(ret).toEqual('Passwords must match');
  });
});
