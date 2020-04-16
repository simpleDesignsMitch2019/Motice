import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { CompanyService } from '../../../shared/services/company/company.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import * as firebase from 'firebase/app';
import { Event } from '../../../shared/interfaces/event';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  settings: Observable<any>;

  public defaultSettings: object = {
    'defaultView' : 'day',
    'nowIndicator' : true,
    'defaultEventLength' : {
      'paramater' : 'minutes',
      'duration' : 30
    },
    'weekStart' : 0,
    'includeWeekends' : false,
    'defaultLocale' : 'en-US',
    'defaultEventColor' : '#FF6900'
  }

  constructor( private authService: AuthService, private companyService: CompanyService, public messageService: MessageService, public afStore: AngularFirestore, public afFunctions: AngularFireFunctions ) {
    this.settings = new Observable((observer) => {
      observer.next(this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('settings').doc('calendar').valueChanges());
      return {
        unsubscribe() {
          this.settings = of(null);
        }
      }
    });
  }

  GetSettings() {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('settings').doc('calendar').ref.get().then((dataSnapshot) => {
        if(dataSnapshot.exists) {
          resolve(dataSnapshot.data());
        } else {
          resolve(this.defaultSettings);
        }
      });
    });
  }

  UpdateSettings(data) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('settings').doc('calendar').ref.set(data, {merge: true}).then((response) => {
        resolve(response);
      }).catch((error) => {
        this.messageService.add({severity:'error',summary:'',detail:error.message});
        reject(error);
      });
    });
  }

  GetEvents() {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('events').ref.get().then((events) => {
        if(events.empty) {
          reject('no-events-found');
        } else {
          let data = [];
          events.forEach((result) => {
            let event = result.data();
            event['id'] = result.id;
            data.push(event);
          });
          resolve(data);
        }
      }).catch((error) => {
        this.messageService.add({severity:'error',summary:'',detail:error.message});
        reject(error);
      });
    });
  }

  GetEvent(event:string) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('events').doc(event).ref.onSnapshot((response) => {
        if(response.exists) {
          resolve(response.data());
        } else {
          this.messageService.add({severity:'error',summary:'',detail:'No event matches that identifier'});
          reject('no-valid-event');
        }
      });
    });
  }

  CreateEvent(event:Event) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('events').add(event).then((response) => {
        this.messageService.add({severity:'success', summary:'', detail:'Event created successfully'});
        resolve(response);
      }).catch((error) => {
        this.messageService.add({severity:'error',summary:'',detail:error.message});
        reject(error);
      });
    });
  }

  UpdateEvent(event:string,data:Event) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('events').doc(event).update(data).then((response) => {
        this.messageService.add({severity:'success', summary:'', detail:'Event updated successfully'});
        resolve(response);
      }).catch((error) => {
        this.messageService.add({severity:'error',summary:'',detail:error.message});
        reject(error);
      });
    });
  }

  DeleteEvent(event:string) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('events').doc(event).delete().then((response) => {
        this.messageService.add({severity:'success', summary:'', detail:'Event deleted successfully'});
        resolve(response);
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    })
  }

}
