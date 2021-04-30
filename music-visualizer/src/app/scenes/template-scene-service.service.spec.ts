import { TestBed } from '@angular/core/testing';

import { TemplateSceneServiceService } from './template-scene-service.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../../environments/environment";
import {NotifierModule} from "angular-notifier";

describe('TemplateSceneServiceService', () => {
  let service: TemplateSceneServiceService;

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
    service = TestBed.inject(TemplateSceneServiceService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
