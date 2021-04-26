import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ForgotPasswordPageComponent } from './forgot-password-page.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import {firebaseConfig} from "../../../environments/environment";
import { NotifierService, NotifierModule } from 'angular-notifier';

describe('ForgotPasswordPageComponent', () => {
  let component: ForgotPasswordPageComponent;
  let fixture: ComponentFixture<ForgotPasswordPageComponent>;

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
      declarations: [ ForgotPasswordPageComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test onSubmit()', () => {
    component.onSubmit();
    // Todo: expect something
  });

  it('test getEmailMessage() with empty email', () => {
    // an invalid email
    component.emailForm.controls.email.setValue('');
    var ret = component.getEmailMessage();
    expect(ret).toEqual('Not a valid email');
  });

  it('test getEmailMessage() with vaild email', () => {
    // a valid email
    component.emailForm.controls.email.setValue('b@bbb.com');
    var ret = component.getEmailMessage();
    expect(ret).toEqual('');
  });
});
