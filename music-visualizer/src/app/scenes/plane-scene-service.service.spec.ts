import { TestBed } from '@angular/core/testing';

import { PlaneSceneServiceService } from './plane-scene-service.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import { firebaseConfig } from '../../environments/environment';
import {NotifierModule} from "angular-notifier";
import {HttpClientModule} from "@angular/common/http";

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
        NotifierModule,
        HttpClientModule,
      ],
    });
    service = TestBed.inject(PlaneSceneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test createScene()', () => {
    expect(true).toBe(false);
  });

  it('test animate()', () => {
    expect(true).toBe(false);
  });

  it('test render()', () => {
    expect(true).toBe(false);
  });

  it('test sceneAnimation()', () => {
    expect(true).toBe(false);
  });

  it('test resize()', () => {
    expect(true).toBe(false);
  });
});
