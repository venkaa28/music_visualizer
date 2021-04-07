import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  public analysis: {};
  public feature: {};

  constructor(public http: HttpClient, private router: Router, private authService: AuthService) { }

  getAuth(){
    let tempURL = "https://accounts.spotify.com/authorize?";
    tempURL += 'client_id=' + environment.clientId + '&';
    tempURL += 'redirect_uri=' + 'https://localhost:4200/Callback/' + '&';
    tempURL += 'scope=' + 'streaming%20user-read-email%20user-read-private%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing' + '&';
    tempURL += 'response_type=token';
    const temp = "https://accounts.spotify.com/authorize?client_id=a59ebb007ffb423c8f8c60ee84492fba&redirect_uri=https://localhost:4200/Callback/&scope=user-read-private%20user-read-email&response_type=token";
    window.location.href = tempURL;
  }

  getTrackAnalysisData(trackID: string){
    try {
      let url = 'https://api.spotify.com/v1/audio-analysis/' + trackID;
      const headers = new HttpHeaders()
        .set("Accept", 'application/json')
        .set("Content-Type", 'application/json')
        .set("Authorization", 'Bearer ' + this.authService.getUser().spotifyAPIKey);
      this.http.get(url, {headers}).subscribe((resp) => this.analysis = resp);
    } catch (e) {
      console.log('Error with HTTP Request to spotify for track analysis data: ' + e);
      throw new Error('Error retrieving track analysis data from spotify ');
    }
  }

  getTrackFeatureData(trackID: string){
    try {
      let url = 'https://api.spotify.com/v1/audio-features/' + trackID;
      const headers = new HttpHeaders()
        .set("Accept", 'application/json')
        .set("Content-Type", 'application/json')
        .set("Authorization", 'Bearer ' + this.authService.getUser().spotifyAPIKey);
      this.http.get(url, {headers}).subscribe((resp) => this.feature = resp);
    } catch (e) {
      console.log('Error with HTTP Request to spotify for track analysis data: ' + e);
      throw new Error('Error retrieving track feature data from spotify ');
    }
  }

  getSegment(trackProgress){
    const segmentIndex = (trackProgress / this.feature['duration_ms'])
      * (this.analysis['segments'].length);
    return this.analysis['segments'][Math.floor(segmentIndex)];
  }

  getBar(trackProgress){
    const barIndex = (trackProgress / this.feature['duration_ms'])
      * (this.analysis['bars'].length);
    return this.analysis['bars'][Math.floor(barIndex)];
  }

  getBeat(trackProgress){
    const beatIndex = (trackProgress / this.feature['duration_ms'])
      * (this.analysis['beats'].length);
    return this.analysis['beats'][Math.floor(beatIndex)];
  }

  getTatum(trackProgress){
    const tatumIndex = (trackProgress / this.feature['duration_ms'])
      * (this.analysis['tatums'].length);
    return this.analysis['tatums'][Math.floor(tatumIndex)];
  }

  getSection(trackProgress){
    const sectionIndex = (trackProgress / this.feature['duration_ms'])
      * (this.analysis['sections'].length);
    return this.analysis['sections'][Math.floor(sectionIndex)];
  }

}
