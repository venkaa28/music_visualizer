///  <reference types="@types/spotify-web-playback-sdk"/>
import { TestBed } from '@angular/core/testing';
import {SpotifyService} from "./spotify.service";
import { SpotifyPlaybackSdkService } from './spotify-playback-sdk.service';
import {RouterTestingModule} from "@angular/router/testing";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../../environments/environment";
import {HttpClientModule} from "@angular/common/http";
import {NotifierModule} from "angular-notifier";

describe('SpotifyPlaybackSdkService', () => {
  let service: SpotifyPlaybackSdkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AngularFireModule.initializeApp(firebaseConfig),
        HttpClientModule,
        NotifierModule
      ],
    });
    service = TestBed.inject(SpotifyPlaybackSdkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
