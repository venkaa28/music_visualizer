import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  constructor(public http: HttpClient, private router: Router) { }

  getAuth(){
    // const url = 'http://localhost:4200/authorize';
    // const params = new HttpParams()
    //   .set('client_id', environment.clientId)
    //   .set('response_type', 'token')
    //   .set('redirect_uri', 'https://localhost:4200/ProfilePage/')
    //   .set('scope', 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming');
    let tempURL = "https://accounts.spotify.com/authorize?";
    tempURL += 'client_id=' + environment.clientId + '&';
    tempURL += 'redirect_uri=' + 'https://localhost:4200/Callback/' + '&';
    tempURL += 'scope=' + 'streaming%20user-read-email%20user-read-private%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing' + '&';
    tempURL += 'response_type=token';
    // console.log(tempURL);
    const temp = "https://accounts.spotify.com/authorize?client_id=a59ebb007ffb423c8f8c60ee84492fba&redirect_uri=https://localhost:4200/Callback/&scope=user-read-private%20user-read-email&response_type=token";
    // console.log(temp);
    // console.log(tempURL.localeCompare(temp));
    // const tempURL_local = "https://localhost:4200/authorize?client_id=a59ebb007ffb423c8f8c60ee84492fba&redirect_uri=https://localhost:4200/ProfilePage/&scope=user-read-private%20user-read-email&response_type=token";
    window.location.href = tempURL;


  }
}
