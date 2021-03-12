import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/Home-Page/home-page.component';
import { LoginPageComponent } from './pages/Login-Page/login-page.component';
import { VisualizationPageComponent } from "./pages/Visualization-Page/visualization-page.component";
import { ForgotPasswordPageComponent } from "./pages/Forgot-Password-Page/forgot-password-page.component";
import { RegisterPageComponent } from './pages/Register-Page/register-page/register-page.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'LoginPage',
    component: LoginPageComponent
  },
  {
    path: 'VisualizationPage',
    component: VisualizationPageComponent
  },
  {
    path: 'ForgotPasswordPage',
    component: ForgotPasswordPageComponent
  },
  {
    path: 'RegisterPage',
    component: RegisterPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
