import { TestBed } from '@angular/core/testing';

import { DemoSceneServiceService } from './demo-scene-service.service';

import { RouterTestingModule } from '@angular/router/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import { firebaseConfig } from '../../environments/environment';
import { NotifierService, NotifierModule } from 'angular-notifier';
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";

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
        NotifierModule,
        HttpClientModule
      ],
    });
    service = TestBed.inject(DemoSceneServiceService);
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
    // todo: renderer is private
    // expect(true).toBe(false);
  });

  it('test makeRoughBall()', () => {
    // service.makeRoughBall();
    expect(true).toBe(false);
  });

  it('test makeRoughGround()', () => {
    // service.makeRoughGround();
    expect(true).toBe(false);
  });

  it('test fractionate()', () => {
    // expect(service.fractionate(2, 1, 3)).toBe(0.5);
    expect(true).toBe(false);
  });

  it('test modulate()', () => {
    // expect(service.modulate(2, 1, 3, 4, 10)).toBe(7);
    expect(true).toBe(false);
  });

  it('test avg()', () => {
    // expect(service.avg([1, 2, 3, 4, 5])).toBe(3);
    expect(true).toBe(false);
  });

  it('test max()', () => {
    // expect(service.max([1, 2, 3, 4, 5])).toBe(5);
    expect(true).toBe(false);
  });
});
