import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {User} from "../../classes/user";
import firebase from "firebase";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent implements OnInit {

  public user: User = new User();
  public signUpForm: FormGroup = new FormGroup({});
  public minLength: number = 6;

  checkPasswords(): null | { notSame: true } {
    const password = this.signUpForm?.get('password')?.value;
    const confirmPassword = this.signUpForm?.get('verifyPassword')?.value;

    return password === confirmPassword ? null : { notSame: true };
  }

  getEmailMessage(): string {
    return this.signUpForm.get('email')?.hasError ? 'Not a valid email' : '';
  }

  // prints error msg if password invalid, nothing if valid
  getPasswordMessage(): string {
    return this.signUpForm.get('password')?.hasError('minlength') ? `Passwords must be at least ${this.minLength} characters long` : '';
  }

  getVerifyPasswordMessage(): string{
   return this.signUpForm.get('password')?.value !== this.signUpForm.get('verifyPassword')?.value ? 'Passwords must match': '';
  }

  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder) {
    this.signUpForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(this.minLength)]),
      verifyPassword: new FormControl('', [Validators.required]),
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: (control) => this.checkPasswords });
  }

  ngOnInit(): void {
  }

  signup = async () => {
    if( this.signUpForm.get('password')?.value != this.signUpForm.get('verifyPassword')?.value ){
      window.alert('Error Passwords do not match');
    } else {
      const uniqueEmail = this.user.email.replace(/[@.]/g, '_');
      this.authService.signUpUser(this.signUpForm.get('email')?.value, this.signUpForm.get('password')?.value).then((userCredential) => {
        const user = userCredential;
      }).then(async () => {
        const uniqueEmail = this.signUpForm.get('email')?.value.replace(/[@.]/g, '_');
        await firebase.database().ref('accounts').child(uniqueEmail).set({
          email: this.signUpForm.get('email')?.value,
          name: this.signUpForm.get('name')?.value,
        });
        await this.authService.getUserData(uniqueEmail);
      }).then(async () => {
        await this.router.navigate(['../../VisualizationPage']);
      }).catch((error) => {
        console.error(error);
        window.alert(error);
      });
    }
  };

}
