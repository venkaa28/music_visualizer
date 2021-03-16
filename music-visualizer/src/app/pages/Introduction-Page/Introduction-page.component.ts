import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
//test
@Component({
  selector: 'app-introduction-page',
  templateUrl: './Introduction-page.component.html',
  styleUrls: ['../../../assets/bootstrap/css/bootstrap.min.css']
})
export class IntroductionPageComponent implements OnInit {
  title = 'Introduction test';

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

}
