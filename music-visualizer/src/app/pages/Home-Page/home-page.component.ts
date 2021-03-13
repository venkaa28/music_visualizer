import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['../../../assets/bootstrap/css/bootstrap.min.css']
})
export class HomePageComponent implements OnInit {
  title = 'Home test';

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

}
