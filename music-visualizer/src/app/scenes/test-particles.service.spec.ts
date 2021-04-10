import { TestBed } from '@angular/core/testing';

import { TestParticlesService } from './test-particles.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../firebase";
import {NotifierModule} from "angular-notifier";

describe('TestParticlesService', () => {
  let service: TestParticlesService;

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
        NotifierModule
      ],
    });
    service = TestBed.inject(TestParticlesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test createScene()', () => {
    // TODO: Integrate
    //expect(true).toBe(false);
  });

  it('test animate()', () => {
    // TODO: Integrate
    //expect(true).toBe(false);
  });

  it('test render()', () => {
    // TODO: Integrate
    // expect(true).toBe(false);
  });

  it('test sceneAnimation()', () => {
    // TODO: Integrate
    //expect(true).toBe(false);
  });

  it('test resize()', () => {
    // TODO: Integrate
    //expect(true).toBe(false);
  });

  it('test makeRoughBall()', () => {
    // TODO: Integrate
    //expect(true).toBe(false);
  });

  it('test fractionate()', () => {
    expect(service.fractionate(2, 1, 3)).toBe(0.5);
  });

  it('test modulate()', () => {
    expect(service.modulate(2, 1, 3, 4, 10)).toBe(7);
  });

  it('test avg()', () => {
    expect(service.avg([1, 2, 3, 4, 5])).toBe(3);
  });

  it('test max()', () => {
    expect(service.max([1, 2, 3, 4, 5])).toBe(5);
  });
});
