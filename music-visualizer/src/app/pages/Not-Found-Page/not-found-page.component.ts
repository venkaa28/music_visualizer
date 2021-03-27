import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.css']
})
export class NotFoundPageComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  // Depreciated: set the route to return the user to
  getRoute(): string {
    if (this.authService.getLoggedIn()) {
      return '../VisualizationPage';
    }

    return '../';
  }

  // Depreciated: set the name to display for the route
  getRouteName(): string {
    if (this.authService.getLoggedIn()) {
      return 'Visualizer';
    }

    return 'Home Page';
  }
}
