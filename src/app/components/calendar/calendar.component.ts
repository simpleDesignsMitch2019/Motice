import { Component, ElementRef, HostListener, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { AppComponent } from '../../app.component';

import * as moment from 'moment';
import * as range from 'lodash.range';

export interface CalendarDate {
  mDate: moment.Moment;
  selected?: boolean;
  today?: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {

  private myTimerSub: Subscription;

  public selectedAction: string = 'events';
  public actions = [
    {
      title: 'Test Event',
      type: 'events',
      color: 'bg-success',
      description: 'Lorem Ipsum Lorem Ipsum...',
      start_time: moment(new Date(2020, 4, 6, 2, 0)),
      end_time: moment(new Date(2020, 4, 6, 3, 0)),
    },
    {
      title: 'Event 1',
      type: 'events',
      color: 'bg-primary',
      description: 'Lorem Ipsum Lorem Ipsum...',
      start_time: moment(new Date(2020, 4, 6, 7, 0)),
      end_time: moment(new Date(2020, 4, 6, 8, 0)),
    },
    {
      title: 'Event 2',
      type: 'events',
      color: 'bg-info',
      description: 'Lorem Ipsum Lorem Ipsum...',
      start_time: moment(new Date(2020, 4, 6, 7, 0)),
      end_time: moment(new Date(2020, 4, 6, 7, 30)),
    },
    {
      title: 'Event 3',
      type: 'events',
      color: 'bg-success',
      description: 'Lorem Ipsum Lorem Ipsum...',
      start_time: moment(new Date(2020, 4, 6, 7, 0)),
      end_time: moment(new Date(2020, 4, 6, 9, 0)),
    },
    {
      title: 'Event 4',
      type: 'events',
      color: 'bg-danger',
      description: 'Lorem Ipsum Lorem Ipsum...',
      start_time: moment(new Date(2020, 4, 6, 7, 0)),
      end_time: moment(new Date(2020, 4, 6, 9, 0)),
    },
    {
      title: 'Meet Paris',
      type: 'events',
      color: 'bg-primary',
      description: 'Lorem Ipsum Lorem Ipsum...',
      start_time: moment(new Date(2020, 4, 7, 12, 0)),
      end_time: moment(new Date(2020, 4, 7, 14, 0)),
    },
    {
      title: 'Do Dishes',
      type: 'reminders',
      color: 'bg-primary',
      description: 'Lorem Ipsum Lorem Ipsum...',
      start_time: moment(new Date(2020, 4, 6, 5, 0)),
      end_time: moment(new Date(2020, 4, 6, 6, 0)),
    }
  ]
  public times = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  public currentTime: any;
  public selectedTimes: any = [];

  public theTime: moment.Moment = moment();
  public currentDate: moment.Moment;
  public namesOfDays: object = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  public weeks: Array<CalendarDate[]> = [];

  public selectedDate;
  public selectedDateFormat;
  public selectedStartWeek;
  public selectedEndWeek;
  public show: boolean = true;

  @ViewChild('calendar', {static: true}) calendar;

  constructor( private appComponent: AppComponent) { }

  ngOnInit(): void {
    const ti = timer(60000,60000);
    this.myTimerSub = ti.subscribe(t => {
      this.theTime = moment();
      if(this.theTime.format('HH') == '0') {
        this.currentDate = moment();
        this.generateCalendar();
        this.generateEvents();
      }
    });
    this.currentDate = moment();
    this.selectedStartWeek = moment().weekday(-7);
    this.selectedEndWeek = moment().weekday(-1);
    this.selectedDate = moment().format('MM/DD');
    this.selectedDateFormat = moment();
    this.currentTime = moment().format('HH');
    this.generateCalendar();
    this.generateEvents();
  }

  ngOnDestroy() {
    this.myTimerSub.unsubscribe();
  }

  close() {
    this.appComponent.calendarSidebarVisible = false;
  }

  public prevMonth(): void {
    this.currentDate = moment(this.currentDate).subtract(1, 'months');
    this.generateCalendar();
    this.generateEvents();
  }

  public nextMonth(): void {
    this.currentDate = moment(this.currentDate).add(1, 'months');
    this.generateCalendar();
    this.generateEvents();
  }

  public isDisabledMonth(currentDate): boolean {
    const today = moment();
    return moment(currentDate).isBefore(today, 'months');
  }

  public isSelectedMonth(date: moment.Moment): boolean {
    const today = moment();
    return moment(date).isSame(this.currentDate, 'month');
  }

  public selectDate(date: CalendarDate) {
    if(moment(date.mDate).isSame(this.currentDate, 'month')) {
      this.selectedDate = moment(date.mDate).format('DD/MM/YYYY');
      this.selectedDateFormat = moment(date.mDate);
      this.currentDate = moment(date.mDate);
      this.generateCalendar();
      this.generateEvents();
    } else {
      this.currentDate = moment(date.mDate);
      this.selectedDate = moment(date.mDate).format('DD/MM/YYYY');
      this.selectedDateFormat = moment(date.mDate);
      this.currentDate = moment(date.mDate);
      this.generateCalendar();
      this.generateEvents();
    }
  }

  public isDayBeforeLastSat(date: moment.Moment):boolean {
    const lastSat = moment().weekday(-1);
    return moment(date).isSameOrBefore(lastSat);
  }

  public goToToday() {
    this.currentDate = moment();
    this.selectedDate = moment().format('DD/MM/YYYY');
    this.selectedDateFormat = moment();
    this.generateCalendar();
    this.generateEvents();
  }

  public adjustActionType(changeTo) {
    this.selectedAction = changeTo;
    this.generateEvents();
  }

  private generateCalendar(): void {
    const dates:any = this.fillDates(this.currentDate);
    const weeks:any = [];
    while(dates.length > 0) {
      weeks.push(dates.splice(0, 7));
    }
    this.weeks = weeks;
  }

  private generateEvents(): void {
    this.selectedTimes = [];
    Object.keys(this.times).forEach(key => {
      let data = {
        time: this.times[key],
        events: []
      }
      let time = this.times[key];
      for (var i = 0; i <= this.actions.length - 1; i++) {
        let event = this.actions[i];
        console.log();
        if(moment(event.start_time).subtract(1, 'month').isSame(this.currentDate, 'date')) {
          if(event.type == this.selectedAction && event.start_time.hour() == time) {
            let eventLength = event.end_time.diff(event.start_time, 'hours')
            event['lengthInHours'] = eventLength;
            if(data.events.length < 3) {
              data.events.push(event);
            } else {
              data['hasMore'] = true;
            }
          } 
        }
      }
      this.selectedTimes.push(data);
    });
  }

  private fillDates(currentMoment: moment.Moment) {
    const firstOfMonth = moment(currentMoment).startOf('month').day();
    const lastOfMonth = moment(currentMoment).endOf('month').day();

    const firstDayOfGrid = moment(currentMoment).startOf('month').subtract(firstOfMonth, 'days');
    const lastDayOfGrid = moment(currentMoment).endOf('month').subtract(lastOfMonth, 'days').add(7, 'days');
    const startCalendar = firstDayOfGrid.date();

    return range(startCalendar, startCalendar + lastDayOfGrid.diff(firstDayOfGrid, 'days')).map((date) => {
      const newDate = moment(firstDayOfGrid).date(date);
      return {
        today: this.isToday(newDate),
        selected: this.isSelected(newDate),
        mDate: newDate,
      };
    });
  }

  private isToday(date: moment.Moment): boolean {
    return moment().isSame(moment(date),'day');
  }

  private isSelected(date: moment.Moment): boolean {
    return this.selectedDate === moment(date).format('DD/MM/YYYY');
  }

}




