import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import { firebaseConfig } from './firebase';
import { NotifierService, NotifierModule } from 'angular-notifier';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        // BrowserModule,
        // AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        // NotifierModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'music-visualizer'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('music-visualizer');
  });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement;
  //   expect(compiled.querySelector('.content span').textContent).toContain('music-visualizer app is running!');
  // });
});
