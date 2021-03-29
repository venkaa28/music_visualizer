import {Injectable, NgZone} from '@angular/core';
import {SpotifyService} from "./spotify.service";
import { BehaviorSubject, Observable } from 'rxjs';
import {AuthService} from "./auth.service";
//import '@types/spotify-web-playback-sdk/index.d.ts';

declare global {
  interface window {
    onSpotifyWebPlaybackSDKReady: () => void;
    spotifyReady: Promise<void>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyPlaybackSdkService {
  private player: Spotify.SpotifyPlayer;
  private deviceId: string;
  private state: Spotify.PlaybackState;

  private subjectPlayState = new BehaviorSubject<Spotify.PlaybackState>(null);
  private subjectTrackEnded = new BehaviorSubject<boolean>(false);
  playStatusTimerId: string;

  constructor(private spotifyService: SpotifyService, private zone: NgZone, private authService: AuthService) { }

  addSpotifyPlaybackSdk() {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.type = 'text/javascript';
    script.addEventListener('load', (e) => {
      console.log(e);
    });
    document.head.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('The Web Playback SDK is ready. We have access to Spotify.Player');
      // console.log(window.Spotify.Player);
      this.player = new Spotify.Player({
        name: 'MusicVisualizer',
        //volume: +localStorage.getItem('musiple-volume') / 100,
        getOAuthToken: (callback) => {
          console.log(this.authService.getSpotifyAuthToken());
          callback(this.authService.getSpotifyAuthToken());

        }
      });
      this.player.addListener('initialization_error', ({ message }) => { console.error(message); });
      this.player.addListener('authentication_error', ({ message }) => { console.error(message); });
      this.player.addListener('account_error', ({ message }) => { console.error(message); });
      this.player.addListener('playback_error', ({ message }) => { console.error(message); });

      this.player.addListener('player_state_changed', state => { console.log(state); });

      this.player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });

      // Not Ready
      this.player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      this.player.connect().then((res) => {
        console.log(res);
      });

      // Ready
      // this.player.on('ready', (data) => {
      //   console.log('Ready with Device ID', data.device_id);
      //   this.deviceId = data.device_id;
      //   //this.spotifyService.deviceId = this.deviceId;
      // });
      //
      // this.player.addListener('player_state_changed', (state) => {
      //   console.log(state);
      //   // if (
      //   //   this.state &&
      //   //   state.track_window.previous_tracks.find((x) => x.id === state.track_window.current_track.id) &&
      //   //   !this.state.paused &&
      //   //   state.paused
      //   // ) {
      //   //   console.log('Track ended');
      //   //   this.zone.run(x => this.setTrackEnd(true));
      //   // }
      //   this.state = state;
      // });
    };
  }
  setPlayState(state: Spotify.PlaybackState) {
    this.state = state;
    this.subjectPlayState.next(state);
  }
  getPlayStatus(): Observable<Spotify.PlaybackState> {
    return this.subjectPlayState.asObservable();
  }
  setTrackEnd(trackEnd: boolean) {
    this.subjectTrackEnded.next(trackEnd);
  }
  getTrackEnd(): Observable<boolean> {
    return this.subjectTrackEnded.asObservable();
  }
}
