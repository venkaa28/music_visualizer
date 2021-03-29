import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

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
    let url = 'https://api.spotify.com/v1/audio-analysis/' + trackID;
    const headers = new HttpHeaders()
      .set("Accept", 'application/json')
      .set("Content-Type", 'application/json')
      .set("Authorization", 'Bearer ' + this.authService.getSpotifyAuthToken());
    const resp = this.http.get(url, {headers}).subscribe(data => console.log(data));
    console.log(resp);
    return resp;
  }

  getTrackFeatureData(trackID: string){
    let url = 'https://api.spotify.com/v1/audio-features/' + trackID;
    const headers = new HttpHeaders()
      .set("Accept", 'application/json')
      .set("Content-Type", 'application/json')
      .set("Authorization", 'Bearer ' + this.authService.getSpotifyAuthToken());
    const resp = this.http.get(url, {headers}).subscribe(data => console.log(data));
    console.log(resp);
    return resp;
  }
}
