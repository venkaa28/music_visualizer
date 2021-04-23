import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NotifierModule } from 'angular-notifier';
import { HttpClientModule } from '@angular/common/http';


// firebase
import { firebaseConfig } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';

// pages
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/Login-Page/login-page.component';
import { HomePageComponent } from './pages/Home-Page/home-page.component';
import { AboutPageComponent } from './pages/About-Page/about-page.component';
import { VisualizationPageComponent } from './pages/Visualization-Page/visualization-page.component';
import { ForgotPasswordPageComponent } from './pages/Forgot-Password-Page/forgot-password-page.component';
import { RegisterPageComponent } from './pages/Register-Page/register-page.component';
import { NotFoundPageComponent } from './pages/Not-Found-Page/not-found-page.component';
import { IntroductionPageComponent } from './pages/Introduction-Page/Introduction-page.component';

// etc
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service'
import { AudioService } from './services/audio.service';
import { CallbackComponent } from './pages/callback/callback.component';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent,
    VisualizationPageComponent,
    ForgotPasswordPageComponent,
    RegisterPageComponent,
    NotFoundPageComponent,
    AboutPageComponent,
    IntroductionPageComponent,
    CallbackComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    NotifierModule,

    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,

    BrowserModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
  ],
  providers: [
    AudioService,
    AuthService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
