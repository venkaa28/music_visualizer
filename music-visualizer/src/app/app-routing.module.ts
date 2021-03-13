import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/Home-Page/home-page.component';
import { LoginPageComponent } from './pages/Login-Page/login-page.component';
import { VisualizationPageComponent } from './pages/Visualization-Page/visualization-page.component';
import { ForgotPasswordPageComponent } from './pages/Forgot-Password-Page/forgot-password-page.component';
import { RegisterPageComponent } from './pages/Register-Page/register-page.component';
import { NotFoundPageComponent } from './pages/Not-Found-Page/not-found-page.component';
import { UserAuthGuard } from './guards/user-auth.guard';

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
    component: LoginPageComponent
  },
  {
    path: 'ForgotPasswordPage',
    component: ForgotPasswordPageComponent
  },
  {
    path: 'VisualizationPage',
    // canActivate: [UserAuthGuard],
    component: VisualizationPageComponent
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
