import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { AngularFireAuthGuard, redirectUnauthorizedTo, loggedIn, emailVerified } from '@angular/fire/auth-guard';
import { EmailVerifiedGuard } from './shared/guards/emailVerified/email-verified.guard';

import { DashboardComponent } from './components/dashboard/dashboard.component';

import { AuthComponent } from './components/auth/auth.component';
  import { LoginComponent } from './components/auth/login/login.component';
  import { RegisterComponent } from './components/auth/register/register.component';
  import { ForgotComponent } from './components/auth/forgot/forgot.component';
  import { VerifyComponent } from './components/auth/verify/verify.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth/login']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AngularFireAuthGuard, EmailVerifiedGuard],
    data: {
      authGuardPipe: redirectUnauthorizedToLogin
    }
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'forgot',
        component: ForgotComponent
      },
      {
        path: 'verify',
        component: VerifyComponent,
        canActivate: [AngularFireAuthGuard],
        data: {
          authGuardPipe: redirectUnauthorizedToLogin
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
