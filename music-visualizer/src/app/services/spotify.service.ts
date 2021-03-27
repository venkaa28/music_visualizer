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
    const url = 'http://localhost:4200/authorize';
    const params = new HttpParams()
      .set('client_id', environment.clientId)
      .set('response_type', 'token')
      .set('redirect_uri', 'localhost:4200/ProfilePage')
      .set('observe', 'response');
      //.set('scope', 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming');
    // this.http.get(url, {params}).subscribe(
    //   (data) => { await this.router.navigate(data.);
    //   },
    //     (error) => {
    //       console.log(error);
    //     });
    const tempURL = "https://accounts.spotify.com/authorize?client_id=a59ebb007ffb423c8f8c60ee84492fba&redirect_uri=https://localhost:4200&scope=user-read-private%20user-read-email&response_type=token";
    this.http.get(url, params, observe: 'callback');
    //this.router.navigate(tempURL as any).then(r => console.log(r));
    window.location.href = tempURL;
    // const options = {
    //   client_id: environment.clientId,
    //   response_type: 'token',
    //   redirect_uri: 'localhost:4200/ProfilePage',
    //   scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming'
    // };


  }
}
