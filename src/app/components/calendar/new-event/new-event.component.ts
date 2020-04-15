import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CalendarService } from '../../../shared/services/calendar/calendar.service';
import { Event } from '../../../shared/interfaces/event';

import * as moment from 'moment';
import * as range from 'lodash.range';

@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.css']
})
export class NewEventComponent implements OnInit {

  public selectedMoment = new Date();
  public eventForm: FormGroup;
  public bgColor: string = '#FF6900';

  constructor( private calendarService: CalendarService, public ref: DynamicDialogRef, public config: DynamicDialogConfig ) { }

  ngOnInit(): void {
    this.eventForm = new FormGroup({
      'title' : new FormControl('', [Validators.required]),
      'description' : new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]),
      'start' : new FormControl('', [Validators.required]),
      'end'   : new FormControl('', [Validators.required]),
      'allDay' : new FormControl(null),
      'editable' : new FormControl(true, [Validators.required]),
      'url' : new FormControl('', [Validators.required]),
      'backgroundColor' : new FormControl('', [Validators.required])
    });
    if(this.config.data && !this.config.data.allDay) {
      this.eventForm.controls['start'].setValue(new Date(this.config.data.startStr));
      this.eventForm.controls['end'].setValue(new Date(this.config.data.endStr));
    } else if(this.config.data && this.config.data.allDay) {
      let start = new Date(moment(this.config.data.startStr).toDate());
      this.eventForm.controls['start'].setValue(start);
      let end = new Date(moment(this.config.data.endStr).toDate());
      this.eventForm.controls['end'].setValue(end);
      this.eventForm.controls['allDay'].setValue(this.config.data.allDay);
      this.eventForm.controls['end'].disable();
    } else {
      this.eventForm.controls['start'].setValue(new Date());
      let end = new Date(moment(new Date()).add(30, 'minutes').toDate());
      this.eventForm.controls['end'].setValue(end);
    }
    this.eventForm.controls['allDay'].valueChanges.subscribe((value) => {
      if(value) {
        let startDate = moment(this.eventForm.controls['start'].value).format('M/D/Y');
        let startTime = new Date(startDate).setHours(0);
        startTime = new Date(startDate).setMinutes(0);
        this.eventForm.controls['start'].setValue(new Date(startDate));
        let endDate = moment(this.eventForm.controls['start'].value).add(1, 'days').format('M/D/Y');
        let endTime = new Date(endDate).setHours(0);
        endTime = new Date(endDate).setMinutes(0);
        this.eventForm.controls['end'].setValue(new Date(endDate));
        this.eventForm.controls['end'].disable();
      } else {
        this.eventForm.controls['end'].reset();
        this.eventForm.controls['end'].enable();
      }
    });
    this.eventForm.controls['start'].valueChanges.subscribe((value) => {
      if(value) {
        this.eventForm.controls['end'].setValue(new Date(moment(this.eventForm.controls['start'].value).add(30, 'minutes').toDate()));
      }
    })
  }

  updateColor($event) {
    this.bgColor = $event.color.hex;
    this.eventForm.controls['backgroundColor'].setValue($event.color.hex);
  }

  close() {
    this.ref.close();
  }

  createEvent() {
    let data:any= {};
    Object.keys(this.eventForm.controls).forEach(key => {
      data[key] = this.eventForm.controls[key].value;
    });
    this.calendarService.CreateEvent(data).then((response) => {
      this.close();
      this.eventForm.reset();
    }).catch((error) => {

    });
  }

}
