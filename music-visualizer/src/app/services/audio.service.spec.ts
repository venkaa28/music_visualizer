import { TestBed } from '@angular/core/testing';

import { AudioService } from './audio.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../firebase";
import {NotifierModule} from "angular-notifier";

describe('AudioService', () => {
  let service: AudioService;

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
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test upload()', () => {
    // var testFile = new File([""], "test.mp3", { type: 'mp3' });
    // service.upload(testFile);
    // todo: expect
    //expect(true).toBe(false);

  });

  it('test getRemoteSong()', () => {
    // var uid = '1';
    // // todo: expect
    // expect(function () { service.getRemoteSong(uid); }).toThrow('A song with that id does not exist on the database');
    //expect(true).toBe(false);
  });

  it('test playOrPause()', () => {
    service.playOrPause();
    // todo: expect
    //expect(true).toBe(false);
  });

  it('test play()', () => {
    service.play();
    // todo: expect
    //expect(true).toBe(false);
  });

  it('test pause()', () => {
    service.pause();
    // todo: expect
    //expect(true).toBe(false);
  });

  it('test loadSong()', () => {
    var mockAudio = new Audio('../../../assets/music/tripleT.mp3');
    service.loadSong(mockAudio);
    // // todo: expect
   // expect(true).toBe(false);
  });
});
