/* Links to check out:
 * Validators: https://angular.io/api/forms/Validators
 * Angular Material Tags: https://material.angular.io/guide/typography
 * AuthService: services/auth.service
 */


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  // html form validator/input for user email
  // public email : FormControl = new FormControl('', [Validators.required, Validators.email]);
  //
  // // html form validator/input for user password
  // public pwd : FormControl = new FormControl('', [Validators.required, Validators.minLength(5)]);

  public minLength: number = 6;

  public loginForm: FormGroup = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(this.minLength)])
  });

  // prints error msg if email invalid, nothing if valid
  getEmailMessage() {
    return this.loginForm.get('email')?.hasError ? 'Not a valid email' : '';
    // return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  // prints error msg if password invalid, nothing if valid
  getPasswordMessage() {
    return this.loginForm.get('password')?.hasError('minlength') ? `Passwords must be at least ${this.minLength} characters long` : '';
    // return this.pwd.hasError('minlength') ? 'Passwords must be at least 5 characters long' : '';
  }

  // called when submit button is clicked, authenticates user on firebase and routes to next page
  // if valid user
  async login() {
    this.authService.loginUser(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value)
    .then(async () => {
      // might need to rethink our user structure
      const uniqueEmail = this.loginForm.get('email')?.value.replace(/[@.]/g, '_');
      this.authService.getUserData(uniqueEmail).then(async () => {
          await this.router.navigate(['../../VisualizationPage']);
      });
    }).catch((error) => {
        window.alert('Invalid username or password!');
    });
  }

  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

}
