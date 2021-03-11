import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.css']
})
export class ForgotPasswordPageComponent implements OnInit {

  emailForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required])
  });
  constructor(public router: Router, private formBuilder: FormBuilder, public authService: AuthService) {
  }

  ngOnInit(): void {
  }

  async onSubmit(): Promise<void> {
    // request reset password email
    console.log(this.emailForm.get('email')?.value);
    try {
      const res = await this.authService.resetPassword(this.emailForm.get('email')?.value);
      console.log(res);
      window.alert(res);
    } catch (error) {
      console.log(error);
      window.alert(error);
    }
  }

}
