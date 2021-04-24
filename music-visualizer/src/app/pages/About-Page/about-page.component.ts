import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {
  public readme: string = "";

  constructor(public http: HttpClient) {
    // load the readme file into the html page
    this.http.get('../../../assets/README.md', {responseType: 'text'})
    .subscribe(data => {
      this.readme = data;
    });
  }

  ngOnInit(): void {
  }

}
