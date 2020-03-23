import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  public state: string;

  constructor( private router: Router ) {
    this.router.events.subscribe((event:Event) => {
      if(event instanceof NavigationEnd) {
        this.state = event.url.split('/')[2];
      }
    });
  }

  ngOnInit(): void {

  }

}
