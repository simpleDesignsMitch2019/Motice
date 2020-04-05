import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  constructor( private appComponent: AppComponent) { }

  ngOnInit(): void {
  }

  close() {
    this.appComponent.notesSidebarVisible = false;
  }

}
