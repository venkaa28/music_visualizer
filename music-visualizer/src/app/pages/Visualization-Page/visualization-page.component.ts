import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-visualization-page',
  templateUrl: './visualization-page.component.html',
  styleUrls: ['./visualization-page.component.css']
})
export class VisualizationPageComponent implements OnInit {

  async logout() {
    await this.authService.logOutUser();
    await this.router.navigate(['../']);
  }

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

}
