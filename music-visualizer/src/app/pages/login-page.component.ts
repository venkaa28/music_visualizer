import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../classes/user';
import { AuthService } from '../services/auth.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  private user : User = new User();


  email = new FormControl('', [Validators.required, Validators.email]);
  pwd = new FormControl('', [Validators.required, Validators.minLength(5)]);

  getEmailMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordMessage() {
    if (this.pwd.hasError('required')) {
      return 'You must enter a value';
    }

    return this.pwd.hasError('minlength') ? 'Passwords must be at least 5 characters long' : '';
  }

  async login() {
    this.user.email = (document.getElementById("email") as HTMLInputElement).value;
    this.user.password = (document.getElementById("pwd") as HTMLInputElement).value;
    
    this.authService.loginUser(this.user.email, this.user.password)
    .then(async () => {
      const uniqueEmail = this.user.email.replace(/[@.]/g, '_');
      this.authService.getUserData(uniqueEmail).then(async () => {
          window.alert("Valid User");
      });
    }).catch((error) => {
        window.alert('Invalid username or password!');
    });
  }

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

}
