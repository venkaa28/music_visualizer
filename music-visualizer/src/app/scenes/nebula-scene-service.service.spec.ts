import { TestBed } from '@angular/core/testing';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import { firebaseConfig } from '../../environments/environment';
import {NotifierModule} from "angular-notifier";
import {NebulaSceneServiceService} from "./nebula-scene-service.service";
import Nebula, { SpriteRenderer, Rate } from 'three-nebula';
import scene3 from './rainbow.json';
import {HttpClientModule} from "@angular/common/http";

describe('NebulaSceneServiceService', () => {
  let service: NebulaSceneServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        // BrowserModule,
        AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        NotifierModule,
        HttpClientModule
      ],
    });
    service = TestBed.inject(NebulaSceneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('test createScene()', () => {
  //   // TODO: Test
  //   //expect(true).toBe(false);
  // });
  //
  // it('test animate()', () => {
  //   // TODO: Test
  //   //expect(true).toBe(false);
  // });
  //
  // it('test render()', () => {
  //   // TODO: Test
  //   //expect(true).toBe(false);
  // });
  //
  // it('test sceneAnimation()', () => {
  //   // TODO: Test
  //   //expect(true).toBe(false);
  // });
  //
  // it('test resize()', () => {
  //   // TODO: Test
  //   //expect(true).toBe(false);
  // });

});
