import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { AuthService } from '../../shared/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public route: string;

  constructor( public router: Router, public authService: AuthService ) {
    this.router.events.subscribe((event:Event) => {
      if(event instanceof NavigationEnd) {
        this.route = event.url.split('/')[2];
      }
    });
  }

  ngOnInit(): void {
  }

}
