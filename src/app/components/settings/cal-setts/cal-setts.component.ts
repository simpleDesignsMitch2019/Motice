import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CalendarService } from '../../../shared/services/calendar/calendar.service';

import locale from 'locale-codes';

@Component({
  selector: 'app-cal-setts',
  templateUrl: './cal-setts.component.html',
  styleUrls: ['./cal-setts.component.css']
})
export class CalSettsComponent implements OnInit {

  public form: FormGroup;

  public viewOptions: any = ['day', 'week', 'month'];
  public paramaters: any = ['minutes', 'hours'];
  public dayOptions: any = [
    {
      'name' : 'Sunday',
      'number' : 0,
    },
    {
      'name' : 'Monday',
      'number' : 1,
    },
    {
      'name' : 'Tuesday',
      'number' : 2,
    },
    {
      'name' : 'Wednesday',
      'number' : 3,
    },
    {
      'name' : 'Thursday',
      'number' : 4,
    },
    {
      'name' : 'Friday',
      'number' : 5,
    },
    {
      'name' : 'Saturday',
      'number' : 6,
    },
  ]
  public localeOptions: any = [];
  public minuteDurations: any = [];
  public hourDurations: any = [];
  public settings: any;

  constructor( public calendarService: CalendarService ) { }

  ngOnInit(): void {

    for (var i = locale.all.length - 1; i >= 0; i--) {
      if(locale.all[i].location !== null) {
        this.localeOptions.push(locale.all[i]);
      }
    }

    let m = 1;
    while(m <= 59) {
      this.minuteDurations = [...this.minuteDurations, m++];
    }

    let h = 1;
    while(h <= 23) {
      this.hourDurations = [...this.hourDurations, h++];
    }

    this.form = new FormGroup({
      'defaultView' : new FormControl('', [Validators.required]),
      'eventDuration' : new FormControl('', [Validators.required]),
      'weekStarts' : new FormControl(null, [Validators.required]),
      'defaultLocale' : new FormControl('', [Validators.required]),
      'includeWeekends' : new FormControl(false, [Validators.required]),
      'defaultEventColor' : new FormControl('', [Validators.required]),
      'nowIndicator' : new FormControl(false, [Validators.required]),
    });
    
    this.settings = this.calendarService.defaultSettings;
    this.calendarService.GetSettings().then((settings:any) => {
      this.settings = settings;
      this.form.controls['defaultView'].setValue(settings.defaultView, {onlySelf: true});
      this.form.controls['eventDuration'].setValue(settings.defaultEventLength.duration, {onlySelf: true});
      this.form.controls['weekStarts'].setValue(settings.weekStart, {onlySelf: true});
      this.form.controls['defaultLocale'].setValue(settings.defaultLocale, {onlySelf: true});
      this.form.controls['includeWeekends'].setValue(settings.includeWeekends, {onlySelf: true});
      this.form.controls['defaultEventColor'].setValue(settings.defaultEventColor, {onlySelf: true});
      this.form.controls['nowIndicator'].setValue(settings.nowIndicator, {onlySelf: true});
    }).catch((error) => {

    });
  }

  updateColor($event) {
    this.settings.defaultEventColor = $event.color.hex;
    this.form.controls['defaultEventColor'].setValue($event.color.hex);
    this.update();
  }

  update() {
    let data = {
      'defaultEventColor' : this.form.controls['defaultEventColor'].value,
      'defaultEventLength': {
        'duration' : this.form.controls['eventDuration'].value,
        'paramater': this.settings.defaultEventLength.paramater
      },
      'defaultLocale' : this.form.controls['defaultLocale'].value,
      'defaultView' : this.form.controls['defaultView'].value,
      'includeWeekends' : this.form.controls['includeWeekends'].value,
      'nowIndicator' : this.form.controls['nowIndicator'].value,
      'weekStart' : this.form.controls['weekStarts'].value
    }
    console.log(data);
    this.calendarService.UpdateSettings(data).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });
  }

  toggle() {
    if(this.settings.nowIndicator) {
      this.settings.nowIndicator = false;
    } else {
      this.settings.nowIndicator = true;
    }
  }

}
