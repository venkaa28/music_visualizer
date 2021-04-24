import {Injectable} from '@angular/core';
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
  public player: Spotify.SpotifyPlayer; // sdk audio player
  private deviceId: string; // this web app's spotify device id
  private state: Spotify.PlaybackState; // playback state
  private currTrackID: string; // id of the current track playing
  private artist: string; // track artist
  private title: string; // track title
  private album: string; // track album cover image url

  private subjectPlayState: BehaviorSubject<Spotify.PlaybackState>;
  private subjectTrackEnded: BehaviorSubject<boolean>;

  constructor(private spotifyAPI: SpotifyService, private authService: AuthService,
              private notifierService: NotifierService) {
    this.player = null;
    this.subjectPlayState = new BehaviorSubject<Spotify.PlaybackState>(null);
    this.subjectTrackEnded = new BehaviorSubject<boolean>(false);

  }

  // set up spotify device listener to connect spotify playback
  public async addSpotifyPlaybackSdk(): Promise<void> {
    // inject javascript into the DOM
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.type = 'text/javascript';

    script.addEventListener('load', (e) => {
      console.log(e);
    });

    // add script to DOM
    document.head.appendChild(script);

    // reset spotify instance if it already existed
    if (this.player !== null) {
      this.player.disconnect();
    }

    // when spotify sdk is ready
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('The Web Playback SDK is ready. We have access to Spotify.Player');
      
      // set up player
      this.player = new Spotify.Player({
        name: 'MusicVisualizer',
        getOAuthToken: (callback) => { // get spotify auth token
          callback(this.authService.getUser().spotifyAPIKey);
        }
      });

      // init error listener
      this.player.addListener('initialization_error', ({ message }) => {
        console.error(message);
        throw new Error('Error with spotify player initialization,' +
          ' please try reloading your browser and authenticating Spotify again');
      });

      // auth error listener
      this.player.addListener('authentication_error', ({ message }) => {
        console.error(message);
        throw new Error('Error with spotify authentication,' +
          ' please try authenticating again');
      });

      // account error listener
      this.player.addListener('account_error', ({ message }) => {
        console.error(message);
        throw new Error('Error with spotify account,' +
          ' please try authenticating again');
      });

      // playback error listener
      this.player.addListener('playback_error', ({ message }) => {
        console.error(message);
        throw new Error('Error with spotify playback,' +
          ' please try reloading your browser and authenticating Spotify again');
      });

      // player state changed listener, i.e. play, pause, skip, rewind, etc.
      this.player.addListener('player_state_changed', async ({ position, duration, paused, track_window: { current_track } }): Promise<void> => {
        this.title = current_track.name; // get title

        // get the artist(s)
        this.artist = '';
        current_track.artists.forEach((value) => {
          this.artist += value.name + ', '; // add artists seperated by ', '
        });
        this.artist = this.artist.slice(0, this.artist.length - 2); // remove final seperator

        this.spotifyAPI.trackDuration = duration; // get track duration
        this.album = current_track.album.images[0].url; // get track album cover image url

        this.currTrackID = current_track.id; // get track id

        try {
          this.spotifyAPI.getTrackAnalysisData(this.currTrackID);
          this.spotifyAPI.getTrackFeatureData(this.currTrackID);
        } catch (e) {
          this.notifierService.notify('error', e + ' Please try reloading the application' +
            ' or authenticate spotify again');
        }

        // set variables that tell spotify API it needs to regenerate its data
        this.spotifyAPI.segmentEnd = 0;
        this.spotifyAPI.sectionEnd = 0;
        this.spotifyAPI.avgSegmentDuration = 0;

        // set html elements
        var htmlAlbum = (document.getElementById('album') as HTMLMediaElement);
        htmlAlbum.src = this.album;
        document.getElementById('song-title').textContent = this.title;
        document.getElementById('song-subtitle').textContent = this.artist;
        (document.getElementById('play') as HTMLMediaElement).src = paused ? '../../assets/icons/play.svg' : '../../assets/icons/pause.svg';
        
        // Preprocess data
        await this.spotifyAPI.getTimbrePreProcessing();
      });

      // player is ready
      this.player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        this.notifierService.notify('success', 'Please connect to MusicVisualizer from Spotify using Spotify Connect');
      });

      // Not Ready
      this.player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // connect player
      this.player.connect().then((res) => {
        console.log(res);
      });
    };
  }

  public setPlayState(state: Spotify.PlaybackState): void {
    this.state = state;
    this.subjectPlayState.next(state);
  }

  public getPlayStatus(): Observable<Spotify.PlaybackState> {
    return this.subjectPlayState.asObservable();
  }
  
  public getTrackEnd(): Observable<boolean> {
    return this.subjectTrackEnded.asObservable();
  }
}
