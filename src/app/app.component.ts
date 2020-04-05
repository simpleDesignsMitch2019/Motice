import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from './shared/services/auth/auth.service';
import { CompanyService } from './shared/services/company/company.service';
import { User } from './shared/interfaces/user';
import { Company } from './shared/interfaces/company';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public user: User;
  public company: Company;
  public leftSidebarVisible: boolean = false;
  public topBarMenuItems: object = [];

  public calendarSidebarVisible: boolean = false;
  public tasksSidebarVisible: boolean = false;
  public notesSidebarVisible: boolean = false;

  constructor(public authService: AuthService, public companyService: CompanyService, private router: Router) {
    authService.user.subscribe((user) => {
      if(user && !user.emailVerified) {
        this.user = null;
      } else if(user) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
    companyService.company.subscribe((observer) => {
      if(observer) {
        observer.subscribe((company) => {
          this.company = company;
        });
      }
    });
    this.topBarMenuItems = [
      {
        label: 'My Profile',
        items: [
          {
            label: 'General',
            icon: 'fad fa-fw fa-user',
            routerLink: ['/profile/general']
          },
          {
            label: 'Company',
            icon: 'fad fa-fw fa-building',
            routerLink: ['/profile/companies']
          },
          {
            label: 'Credentials',
            icon: 'fad fa-fw fa-lock',
            routerLink: ['/profile/credentials']
          },
          {
            label: 'Subscription',
            icon: 'fad fa-fw fa-tag',
            routerLink: ['/profile/subscription']
          }
        ]
      },
      {
        separator: true,
        items: [
          {
            label: 'Calendar',
            icon: 'fad fa-fw fa-calendar text-info',
            command: (event) => {
              this.calendarSidebarVisible = !this.calendarSidebarVisible;
              this.tasksSidebarVisible = false;
              this.notesSidebarVisible = false;
            }
          },
          {
            label: 'Tasks',
            icon: 'fad fa-fw fa-tasks text-success',
            command: (event) => {
              this.tasksSidebarVisible = !this.tasksSidebarVisible;
              this.calendarSidebarVisible = false;
              this.notesSidebarVisible = false;
            }
          },
          {
            label: 'Notes',
            icon: 'fad fa-fw fa-sticky-note text-warning',
            command: (event) => {
              this.notesSidebarVisible = !this.notesSidebarVisible;
              this.calendarSidebarVisible = false;
              this.tasksSidebarVisible = false;
            }
          }
        ]
      },
      {
        separator: true,
        items: [
          {
            label: 'Settings',
            icon: 'fad fa-fw fa-cog text-primary',
            routerLink: ['/settings']
          },
          {
            label: 'Logout',
            icon: 'fad fa-fw fa-sign-out',
            command: (event) => {
              this.calendarSidebarVisible = false;
              this.tasksSidebarVisible = false;
              this.notesSidebarVisible = false;
              this.leftSidebarVisible = false;
              authService.SignOut().then(() => {

              }).catch((error) => {

              });
            }
          },
        ]
      }
    ]
  }
 
}
