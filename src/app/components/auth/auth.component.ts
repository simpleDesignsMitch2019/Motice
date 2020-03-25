import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { AuthService } from '../../shared/services/auth/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  public state: string;

  constructor( private router: Router, public authService: AuthService ) {
    this.router.events.subscribe((event:Event) => {
      if(event instanceof NavigationEnd) {
        this.state = event.url.split('/')[2];
      }
    });
  }

  ngOnInit(): void {

  }

}
