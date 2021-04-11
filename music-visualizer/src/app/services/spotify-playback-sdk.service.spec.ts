///  <reference types="@types/spotify-web-playback-sdk"/>
import { TestBed } from '@angular/core/testing';
import {SpotifyService} from "./spotify.service";
import { SpotifyPlaybackSdkService } from './spotify-playback-sdk.service';

describe('SpotifyPlaybackSdkService', () => {
  let service: SpotifyPlaybackSdkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyPlaybackSdkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
