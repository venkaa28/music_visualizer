import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {NotifierService} from 'angular-notifier';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.css']
})
export class ForgotPasswordPageComponent implements OnInit {

  private readonly notifier: NotifierService;

  emailForm = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  constructor(public router: Router, private formBuilder: FormBuilder, public authService: AuthService, notifierService: NotifierService) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
  }

  async onSubmit(): Promise<void> {
    // request reset password email
    console.log(this.emailForm.get('email')?.value);
    try {
      const res = await this.authService.resetPassword(this.emailForm.get('email')?.value);
      console.log(res);
      this.notifier.notify('success', 'Email has been sent!');
    } catch (error) {
      console.log(error);
      this.notifier.notify('error', 'Whoops, looks like something went wrong!');
    }
  }

  // prints error msg if email invalid, nothing if valid
  getEmailMessage = () => {
    return this.emailForm.get('email')?.hasError ? 'Not a valid email' : '';
    // return this.email.hasError('email') ? 'Not a valid email' : '';
  }

}
