import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { CompanyService } from '../../../shared/services/company/company.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class CoasService {

  chartOfAccounts: Observable<any>;

  constructor( private authService: AuthService, private companyService: CompanyService, public messageService: MessageService, public afStore: AngularFirestore, public afFunctions: AngularFireFunctions ) {
    this.chartOfAccounts = new Observable((observer) => {
      observer.next(this.afStore.collection('companies').doc(localStorage.getItem('activeCompany')).collection('COAS').valueChanges());
      return {
        unsubscribe() {
          this.settings = of(null);
        }
      }
    });
  }
}
