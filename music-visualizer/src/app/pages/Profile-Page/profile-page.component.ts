import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['../../../assets/bootstrap/css/bootstrap.min.css']
})
export class ProfilePageComponent implements OnInit {
  title = 'Profile test';

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

}
