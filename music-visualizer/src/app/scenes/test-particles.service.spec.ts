import { TestBed } from '@angular/core/testing';

import { TestParticlesService } from './test-particles.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import { firebaseConfig } from '../../environments/environment';
import {NotifierModule} from "angular-notifier";
import {HttpClientModule} from "@angular/common/http";

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
        NotifierModule,
        HttpClientModule,
      ],
    });
    service = TestBed.inject(TestParticlesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
