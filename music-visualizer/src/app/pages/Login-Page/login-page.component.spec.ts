import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LoginPageComponent } from './login-page.component';
import {AngularFireModule} from "@angular/fire";
import { firebaseConfig } from '../../../environments/environment';
import {NotifierModule} from "angular-notifier";

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
        NotifierModule
      ],
      declarations: [ LoginPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test getEmailMessage() with empty email', () => {
    // an invalid email
    component.loginForm.controls.email.setValue('');
    var ret = component.getEmailMessage();
    expect(ret).toEqual('Not a valid email');
  });

  it('test getEmailMessage() with vaild email', () => {
    // a valid email
    component.loginForm.controls.email.setValue('b@b.bbb');
    var ret = component.getEmailMessage();
    expect(ret).toEqual('');
  });

  it('test passwordMessage() with empty password', () => {
    // an empty password
    component.loginForm.controls.password.setValue('');
    var ret = component.getPasswordMessage();
    expect(ret).toEqual(`Passwords must be at least ${component.minLength} characters long`);
  });

  it('test passwordMessage() with short password', () => {
    // an short password
    component.loginForm.controls.password.setValue('123');
    var ret = component.getPasswordMessage();
    expect(ret).toEqual(`Passwords must be at least ${component.minLength} characters long`);
  });

  it('test passwordMessage() with valid password', () => {
    // an valid password
    component.loginForm.controls.password.setValue('123456');
    var ret = component.getPasswordMessage();
    expect(ret).toEqual('');
  });

});
