import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePageComponent } from './profile-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import {firebaseConfig} from "../../../environments/environment";
import { NotifierService, NotifierModule } from 'angular-notifier';
describe('ProfilePageComponent', () => {
  let component: ProfilePageComponent;
  let fixture: ComponentFixture<ProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ ProfilePageComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // getUserCookie has moved
  // it('check email and name', () => {
  //   const cookie = component.getUserCookie();
  //   component.getUserData();
  //   if(cookie === '') {
  //     expect(component.userData.email).toBe('');
  //     expect(component.userData.name).toBe('');
  //   }
  //   else {
  //     expect(component.userData.email).toBe('hustzmx@gmail.com');
  //     expect(component.userData.name).toBe('zmx');
  //   }
  // });
});
