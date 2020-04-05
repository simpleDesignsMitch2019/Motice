import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  constructor( private appComponent: AppComponent) { }

  ngOnInit(): void {
  }

  close() {
    this.appComponent.tasksSidebarVisible = false;
  }

}
