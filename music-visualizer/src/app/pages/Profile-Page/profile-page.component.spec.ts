import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePageComponent } from './profile-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import { firebaseConfig } from '../../firebase';
import { NotifierService, NotifierModule } from 'angular-notifier';
import { Router } from '@angular/router';
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

  it('check email and name', () => {
    const cookie = component.getUserCookie();
    component.getUserData();
    if(cookie === '') {
      expect(component.userData.email).toBe('');
      expect(component.userData.name).toBe('');
    }
    else {
      expect(component.userData.email).toBe('hustzmx@gmail.com');
      expect(component.userData.name).toBe('zmx');
    }
  });

  it ('test logout', () => {
    component.logout();
    expect(component.router.url).toBe("http://localhost:4200/");
  });

  it('test goBackToVisualPage', () => {
    component.goBackToVisualPage();
    expect(component.router.url).toBe("http://localhost:4200/VisualizationPage");
  });
});
