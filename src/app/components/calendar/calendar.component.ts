import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  constructor( private appComponent: AppComponent) { }

  ngOnInit(): void {
  }

  close() {
    this.appComponent.calendarSidebarVisible = false;
  }

}
