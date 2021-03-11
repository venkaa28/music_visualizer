import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../classes/user';
import { AuthService } from '../../services/auth.service'
import {FormBuilder, FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  title = 'Test';
  private user: User = new User();

  loginForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private authService: AuthService, public router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  onSubmit = () => {

    this.authService.loginUser(this.loginForm.get(['email'])?.value, this.loginForm.get(['password'])?.value)
      .then(async () => {
        const uniqueEmail = this.user.email.replace(/[@.]/g, '_');
        this.authService.getUserData(uniqueEmail).then(async () => {
          window.alert('Valid User');
        });
      }).catch((error) => {
      window.alert('Invalid username or password!');
    });
  };
}
