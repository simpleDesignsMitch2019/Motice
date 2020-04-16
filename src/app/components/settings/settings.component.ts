import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  public activeSetting: string = 'branding';

  constructor( public appComponent: AppComponent ) { }

  ngOnInit(): void {
  }

  close() {
    this.appComponent.settingsSidebarVisible = false;
  }

  setActiveSetting(setting:string) {
    this.activeSetting = setting;
  }

}
