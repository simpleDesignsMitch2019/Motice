import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../../app.component';
import { CalendarService } from '../../shared/services/calendar/calendar.service';
import { FullCalendar } from 'primeng/fullcalendar';
import { DialogService } from 'primeng/dynamicdialog';

import { NewEventComponent } from './new-event/new-event.component';
import { EditEventComponent } from './edit-event/edit-event.component';

import { Event } from '../../shared/interfaces/event';

import allLocales from '@fullcalendar/core/locales-all';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import * as moment from 'moment';
import * as range from 'lodash.range';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  public settings: any;

  @ViewChild('fc') public fc: FullCalendar;
  @ViewChild('ec') public ec: FullCalendar;

  public view: string = 'timeGridDay';

  events: any;

  dayOptions: any;
  selectedDate: any;
  eventCalOptions: any;

  constructor( private calendarService: CalendarService, private appComponent: AppComponent, public dialogService: DialogService ) {
  
  }

  ngOnInit(): void {

    this.settings = this.calendarService.defaultSettings;

    this.selectedDate = moment().toDate();
    
    this.dayOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      defaultDate: moment().toDate(),
      nowIndicator: this.settings.nowIndicator,
      weekends: this.settings.includeWeekends,
      locale: this.settings.defaultLocale,
      firstDay: this.settings.weekStart,
      height: "parent",
      defaultView: this.view,
      header: {
        left: 'prev',
        center: 'title',
        right: 'next'
      },
      dateClick: (e) => {
        if(this.view == 'dayGridMonth') {
          this.selectedDate = moment(e.date).toDate();
          this.fc.getCalendar().gotoDate(new Date(e.date));
          this.ec.getCalendar().gotoDate(new Date(e.date));
        }
      },
      eventClick: (info) => {
        this.openEditEvent(info.event);
        info.jsEvent.preventDefault();
      },
      select: (selectionInfo) => {
        this.openNewEvent(selectionInfo);
      },
      eventResize: (info) => {
        this.updateEvent(info.event);
      },
      eventDrop: (info) => {
        this.updateEvent(info.event);
      }
    }

    this.eventCalOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      defaultDate: this.selectedDate,
      nowIndicator: this.settings.nowIndicator,
      weekends: this.settings.includeWeekends,
      locale: this.settings.defaultLocale,
      firstDay: this.settings.weekStart,
      selectable: true,
      allDayText: 'All Day',
      columnHeaderFormat: {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        omitCommas: false
      },
      scrollTime: moment().format('HH:mm:ss'),
      height: 390,
      defaultView: 'timeGridDay',
      header: null,
      select: (selectionInfo) => {
        this.openNewEvent(selectionInfo);
      },
      eventResize: (info) => {
        this.updateEvent(info.event);
      },
      eventDrop: (info) => {
        this.updateEvent(info.event);
      }
    }

    this.getEvents();

    this.calendarService.settings.subscribe((observer) => {
      observer.subscribe((settings) => {
        this.settings = settings;
        switch(settings.defaultView) {
          case 'day' :
            this.changeView('timeGridDay');
          break;
          case 'week' : 
            this.changeView('timeGridWeek');
          break;
          case 'month' :
            this.changeView('dayGridMonth');
          break;
        }
      });
    });

  }

  updateEvent(event) {
    this.getEvents();
    this.calendarService.UpdateEvent(event.id, {
      'title' : event.title,
      'description' : event.extendedProps.description,
      'start' : event.start,
      'end' : event.end,
      'allDay' : event.allDay,
      'editable' : event.durationEditable,
      'url' : event.url,
      'backgroundColor' : event.backgroundColor,
      'source' : event.source.id
    });
    if(this.view == 'dayGridMonth') {
      this.ec.getCalendar().rerenderEvents();
    }
    this.fc.getCalendar().rerenderEvents();
  }

  getEvents() {
    this.calendarService.GetEvents().then((events:any) => {
      this.events = [];
      if(events) {
        for (var i = events.length - 1; i >= 0; i--) {
          let event = events[i];
          event['start'] = new Date(event['start'].seconds*1000);
          event['end'] = new Date(event['end'].seconds*1000);
          this.events = [...this.events, event];
        }
      }
    }).catch((error) => {
      this.events = [];
    });
  }

  openNewEvent(data?) {
    let view = this.view;
    this.changeView('timeGridDay');
    if(!data) {
      let data = {};
    }
    const ref = this.dialogService.open(NewEventComponent, {
      data: data,
      header: 'Create New Event',
      width: '45%',
      autoZIndex: false
    });
    ref.onClose.subscribe((observer) => {
      this.getEvents();
      this.changeView(view);
    });
  }

  openEditEvent(data) {
    const ref = this.dialogService.open(EditEventComponent, {
      data: data,
      header: 'Edit Event',
      width: '45%',
      autoZIndex: false
    });
    ref.onClose.subscribe((observer) => {
      this.getEvents();
    });
  }

  close() {
    this.appComponent.calendarSidebarVisible = false;
  }

  goToToday():void {
    if(this.view == 'dayGridMonth') {
      this.ec.getCalendar().gotoDate(moment().toDate());
    }
    this.fc.getCalendar().gotoDate(moment().toDate());
  }

  changeView(view):void {
    if(view == 'timeGridDay') {
      this.fc.getCalendar().setOption('selectable', true);
      this.fc.getCalendar().setOption('weekends', this.settings.includeWeekends);
      this.fc.getCalendar().setOption('nowIndicator', this.settings.nowIndicator);
      this.fc.getCalendar().setOption('locale', this.settings.defaultLocale);
      this.fc.getCalendar().setOption('firstDay', this.settings.weekStart);
      this.appComponent.calSidebarStyleClass = 'ui-sidebar-sm p-0';
    } else if(view == 'timeGridWeek') {
      this.fc.getCalendar().setOption('selectable', true);
      this.fc.getCalendar().setOption('weekends', this.settings.includeWeekends);
      this.fc.getCalendar().setOption('nowIndicator', this.settings.nowIndicator);
      this.fc.getCalendar().setOption('locale', this.settings.defaultLocale);
      this.fc.getCalendar().setOption('firstDay', this.settings.weekStart);
      this.appComponent.calSidebarStyleClass = 'ui-sidebar-md p-0';
    } else if(view == 'dayGridMonth') {
      this.fc.getCalendar().setOption('selectable', false);
      this.fc.getCalendar().setOption('weekends', this.settings.includeWeekends);
      this.fc.getCalendar().setOption('nowIndicator', this.settings.nowIndicator);
      this.fc.getCalendar().setOption('locale', this.settings.defaultLocale);
      this.fc.getCalendar().setOption('firstDay', this.settings.weekStart);
      this.appComponent.calSidebarStyleClass = 'ui-sidebar-lg p-0';
      setTimeout(() => {
        this.ec.getCalendar().setOption('weekends', this.settings.includeWeekends);
        this.ec.getCalendar().setOption('nowIndicator', this.settings.nowIndicator);
        this.ec.getCalendar().setOption('locale', this.settings.defaultLocale);
      });
    }
    this.view = view;
    this.fc.getCalendar().changeView(view);
  }

}
