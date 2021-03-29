import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) { }

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('access_token');
    let fragment = this.route.snapshot.fragment;
    let auth_token = fragment.substring(fragment.indexOf('=')+1, fragment.indexOf('&'));
    this.authService.setSpotifyAuthToken(auth_token);
    console.log(this.authService.getUser());
    await this.router.navigate(['../../ProfilePage']);
  }

}
