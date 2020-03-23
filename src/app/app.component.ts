import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './shared/services/auth/auth.service';
import { User } from './shared/interfaces/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public user: User;
  public leftSidebarVisible: boolean = false;
  public topBarCollapsed: boolean = true;

  constructor(public authService: AuthService, private router: Router) {
    authService.user.subscribe((user) => {
      if(!user.emailVerified) {
        this.user = null;
      } else {
        this.user = user;
      }
    });
  }
 
}
