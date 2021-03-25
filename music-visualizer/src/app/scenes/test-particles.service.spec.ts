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
});
