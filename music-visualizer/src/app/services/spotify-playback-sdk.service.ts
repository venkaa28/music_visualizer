import {Injectable, NgZone} from '@angular/core';
import {SpotifyService} from "./spotify.service";
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {AuthService} from './auth.service';
import {NotifierService} from 'angular-notifier';
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
  public player: Spotify.SpotifyPlayer;
  private deviceId: string;
  private state: Spotify.PlaybackState;
  private currTrackID: string;
  private artist: string;
  private title: string;
  private album: string;


  private subjectPlayState = new BehaviorSubject<Spotify.PlaybackState>(null);
  private subjectTrackEnded = new BehaviorSubject<boolean>(false);

  constructor(private spotifyService: SpotifyService, private zone: NgZone, private authService: AuthService,
              private notifierService: NotifierService) {
    this.player = null;
  }

  async addSpotifyPlaybackSdk(scene: any) {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.type = 'text/javascript';

    script.addEventListener('load', (e) => {
      console.log(e);
    });

    document.head.appendChild(script);

    if (this.player !== null) {
      this.player.disconnect();
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('The Web Playback SDK is ready. We have access to Spotify.Player');
      this.player = new Spotify.Player({
        name: 'MusicVisualizer',
        // volume: +localStorage.getItem('musiple-volume') / 100,
        getOAuthToken: (callback) => {
          callback(this.authService.getUser().spotifyAPIKey);
        }
      });
      this.player.addListener('initialization_error', ({ message }) => {
        console.error(message);
        throw new Error('Error with spotify player initialization,' +
          ' please try reloading your browser and authenticating Spotify again');
      });
      this.player.addListener('authentication_error', ({ message }) => {
        console.error(message);
        throw new Error('Error with spotify authentication,' +
          ' please try authenticating again');
      });
      this.player.addListener('account_error', ({ message }) => {
        console.error(message);
        throw new Error('Error with spotify account,' +
          ' please try authenticating again');
      });
      this.player.addListener('playback_error', ({ message }) => {
        console.error(message);
        throw new Error('Error with spotify playback,' +
          ' please try reloading your browser and authenticating Spotify again');
      });

      this.player.addListener('player_state_changed', ({
                                                    position,
                                                    duration,
                                                    paused,
                                                    track_window: { current_track },
                                                  }) => {
        this.title = current_track.name;

        this.artist = '';
        current_track.artists.forEach((value) => {
          this.artist += value.name + ', ';
        });
        this.artist = this.artist.slice(0, this.artist.length - 2);
        this.spotifyService.trackDuration = duration;
        this.album = current_track.album.images[0].url;

        this.currTrackID = current_track.id;

        try {
          this.spotifyService.getTrackAnalysisData(this.currTrackID);
          this.spotifyService.getTrackFeatureData(this.currTrackID);
        } catch (e) {
          this.notifierService.notify('error', e + ' Please try reloading the application' +
            ' or authenticate spotify again');
        }

        this.spotifyService.segmentEnd = 0;
        this.spotifyService.sectionEnd = 0;
        this.spotifyService.avgSegmentDuration = 0;

        var htmlAlbum = (document.getElementById('album') as HTMLMediaElement)
        htmlAlbum.src = this.album;
        this.spotifyService.firstTimbrePreProcess = null;
        this.spotifyService.brightnessTimbrePreProcess = null;
        document.getElementById('song-title').textContent = this.title;
        document.getElementById('song-subtitle').textContent = this.artist;
        (document.getElementById('play') as HTMLMediaElement).src = paused ? '../../assets/icons/play.svg' : '../../assets/icons/pause.svg';

        // scene.animate();
      });
     // this.player.addListener('player_state_changed', state => { track_window: { current_track } });
      // player is ready
      this.player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        this.notifierService.notify('success', 'Please connect to MusicVisualizer from Spotify using Spotify Connect');
      });

      // Not Ready
      this.player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      this.player.connect().then((res) => {
        console.log(res);
      });
    };
  }
  setPlayState(state: Spotify.PlaybackState) {
    this.state = state;
    this.subjectPlayState.next(state);
  }
  getPlayStatus(): Observable<Spotify.PlaybackState> {
    return this.subjectPlayState.asObservable();
  }
  getTrackEnd(): Observable<boolean> {
    return this.subjectTrackEnded.asObservable();
  }
}
