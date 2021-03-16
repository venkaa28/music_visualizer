import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserAuthGuard } from './guards/user-auth.guard';

import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/Home-Page/home-page.component';
import { LoginPageComponent } from './pages/Login-Page/login-page.component';
import { VisualizationPageComponent } from './pages/Visualization-Page/visualization-page.component';
import { IntroductionPageComponent } from './pages/Introduction-Page/Introduction-page.component';
import { ForgotPasswordPageComponent } from './pages/Forgot-Password-Page/forgot-password-page.component';
import { RegisterPageComponent } from './pages/Register-Page/register-page.component';
import { NotFoundPageComponent } from './pages/Not-Found-Page/not-found-page.component';
import { LoggedInGuard } from './guards/logged-in.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'RegisterPage',
    component: RegisterPageComponent
  },
  {
    path: 'LoginPage',
    canActivate: [LoggedInGuard],
    component: LoginPageComponent
  },
  {
    path: 'ForgotPasswordPage',
    component: ForgotPasswordPageComponent
  },
  {
    path: 'VisualizationPage',
    canActivate: [UserAuthGuard],
    component: VisualizationPageComponent
  },
  {
    path: 'IntroductionPage',
    component: IntroductionPageComponent
  },
  {
    path: '404',
    component: NotFoundPageComponent
  },
  {
    path: '**',
    redirectTo: '404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
