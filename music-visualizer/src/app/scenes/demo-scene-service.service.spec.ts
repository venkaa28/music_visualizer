import { TestBed } from '@angular/core/testing';

import { DemoSceneServiceService } from './demo-scene-service.service';

import { RouterTestingModule } from '@angular/router/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import { firebaseConfig } from '../firebase';
import { NotifierService, NotifierModule } from 'angular-notifier';
import {ReactiveFormsModule} from "@angular/forms";

describe('DemoSceneServiceService', () => {
  let service: DemoSceneServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        // BrowserModule,
        AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        NotifierModule
      ],
    });
    service = TestBed.inject(DemoSceneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
