/* Links to check out:
 * Validators: https://angular.io/api/forms/Validators
 * Angular Material Tags: https://material.angular.io/guide/typography
 * AuthService: services/auth.service
 */


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  // html form validator/input for user email
  public email : FormControl = new FormControl('', [Validators.required, Validators.email]);

  // html form validator/input for user password
  public pwd : FormControl = new FormControl('', [Validators.required, Validators.minLength(5)]);

  // prints error msg if email invalid, nothing if valid
  getEmailMessage() {
    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  // prints error msg if password invalid, nothing if valid
  getPasswordMessage() {
    return this.pwd.hasError('minlength') ? 'Passwords must be at least 5 characters long' : '';
  }

  // called when submit button is clicked, authenticates user on firebase and routes to next page
  // if valid user
  async login() {
    this.authService.loginUser(this.email.value, this.pwd.value)
    .then(async () => {
      const uniqueEmail = this.email.value.replace(/[@.]/g, '_');
      this.authService.getUserData(uniqueEmail).then(async () => {
          await this.router.navigate(['../../VisualizationPage']);
      });
    }).catch((error) => {
        window.alert('Invalid username or password!');
    });
  }

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

}
