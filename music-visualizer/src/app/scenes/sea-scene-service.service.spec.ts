import { TestBed } from '@angular/core/testing';

import { SeaSceneService } from './sea-scene-service.service';
import {ElementRef, ViewChild} from "@angular/core";
import {RouterTestingModule} from "@angular/router/testing";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../../environments/environment";
import {NotifierModule} from "angular-notifier";
import {HttpClientModule} from "@angular/common/http";


describe('SeaSceneService', () => {
  let service: SeaSceneService;

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
    service = TestBed.inject(SeaSceneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('test createScene()', () => {
  //   expect(true).toBe(false);
  // });
});
