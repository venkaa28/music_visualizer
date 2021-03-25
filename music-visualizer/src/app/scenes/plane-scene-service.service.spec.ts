import { TestBed } from '@angular/core/testing';

import { PlaneSceneServiceService } from './plane-scene-service.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../firebase";
import {NotifierModule} from "angular-notifier";

describe('PlaneSceneServiceService', () => {
  let service: PlaneSceneServiceService;

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
    service = TestBed.inject(PlaneSceneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
