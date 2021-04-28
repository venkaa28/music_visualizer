/* Links to check out:
 * Validators: https://angular.io/api/forms/Validators
 * Angular Material Tags: https://material.angular.io/guide/typography
 * AuthService: services/auth.service
 */


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  public minLength: number = 6; // minimum password length, firebase requires min of 6 char
  private useCookies = false;

  // The form group used for form validation
  public loginForm: FormGroup = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(this.minLength)]),
  });

  // prints error msg if email invalid, nothing if valid
  getEmailMessage() {
    return this.loginForm.get('email')?.hasError ? 'Not a valid email' : '';
  }

  // prints error msg if password invalid, nothing if valid
  getPasswordMessage() {
    return this.loginForm.get('password')?.hasError('minlength') ? `Passwords must be at least ${this.minLength} characters long` : '';
  }

  // set cookie storing policy for user account
  updateCookieUsage(event) {
    this.useCookies = event.srcElement.value;
  }

  // called when submit button is clicked, authenticates user on firebase and routes to next page
  // if valid user
  async login() {
    // login user with provided email and password
    this.authService.loginUser(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value, this.useCookies)
    .then(async () => {
      // navigate to Visualization Page
      await this.router.navigate(['../../VisualizationPage']);
    }).catch((error) => {
      // some firebase issue has occurred (most likely bad account, password) so notify user
      this.notifierService.notify('error', error);
    });
  }

  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder,
              private readonly  notifierService: NotifierService) { }

  ngOnInit(): void {
  }

}
