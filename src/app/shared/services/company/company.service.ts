import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { MessageService } from 'primeng/api';
import { SubscriptionService } from '../../../shared/services/subscription/subscription.service';
import * as firebase from 'firebase/app';
import { Company } from '../../../shared/interfaces/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  company: Observable<any>;

  constructor( private subscriptionService: SubscriptionService, public authService: AuthService, public messageService: MessageService, public afStore: AngularFirestore, public afFunctions: AngularFireFunctions ) {
    this.company = new Observable((observer) => {
      this.authService.user.subscribe((user) => {
        if(user && user.company) {
          localStorage.setItem('activeCompany', user.company);
          observer.next(this.afStore.collection('companies').doc(user.company).valueChanges());
        } else {
          observer.next(null);
        }
      });
      return {
        unsubscribe() {
          this.company = of(null);
        }
      }
    });
  }

  CheckAvailability(name:string) {
    return new Promise((resolve, reject) => {
      if(name) {
        this.afStore.collection('companies').ref.where('name', '==', name).get().then((dataSnapshot) => {
          if(dataSnapshot.empty) {
            resolve('name-available');
          } else {
            reject('name-already-exists');
          }
        });
      } else {
        reject('no-name-provided');
      }
    });
  }

  GetActiveUid(company:string) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').ref.where('name', '==', company).get().then((dataSnapshot) => {
        resolve(dataSnapshot.docs[0].id);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  CreateCompany(data:any) {
    return new Promise((resolve, reject) => {
      this.CheckAvailability(data.name).then((value) => {
        this.afStore.collection('companies').add(data).then((company) => {
          resolve(company.id);
        }).catch((error) => {
          this.messageService.add({severity:'error', summary:'', detail:error.message});
          reject(error);
        });
      }).catch((error) => {
        if(error == 'name-already-exists') {
          this.messageService.add({severity:'error', summary:'', detail:'Company name already exists'});
          reject(error);
        }
      });
    });
  }

  UpdateCompany(company:string, data:Company) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(company).set(data, { merge: true }).then((company) => {
        resolve(company);
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      })
    });
  }

  DeleteCompany(id:string) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('companies').doc(id).delete().then((company) => {
        resolve(company);
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      })
    });
  }

}
