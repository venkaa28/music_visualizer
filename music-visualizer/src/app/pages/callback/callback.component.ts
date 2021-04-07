import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {NotifierService} from 'angular-notifier';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService,
              private notifierService: NotifierService) { }

  async ngOnInit(): Promise<void> {
    try {
      const token = this.route.snapshot.queryParamMap.get('access_token');
      const fragment = this.route.snapshot.fragment;
      const auth_token = fragment.substring(fragment.indexOf('=') + 1, fragment.indexOf('&'));
      await this.authService.setSpotifyAuthToken(auth_token);
      this.notifierService.notify('success', 'Succesfully authenticated Spotify');
      await this.router.navigate(['../../ProfilePage']);
    }catch (e) {
      this.notifierService.notify('error', 'Unsuccessful Spotify Authentication');
    }
  }

}
