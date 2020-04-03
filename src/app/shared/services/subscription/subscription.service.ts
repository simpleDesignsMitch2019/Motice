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
import * as firebase from 'firebase/app';
import { User } from '../../../shared/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  user: User;
  subscription: Observable<any>;

  constructor( public authService: AuthService,  public messageService: MessageService, public afAuth: AngularFireAuth, public afStore: AngularFirestore, public afFunctions: AngularFireFunctions, public router: Router ) {
    this.subscription = new Observable((observer) => {
      this.authService.user.subscribe((user) => {
        this.user = user;
        if(user && user.subscriptionId) {
          observer.next(this.afStore.collection('subscriptions').doc(user.subscriptionId).valueChanges());
        } else {
          observer.next(null);
        }
      });
      return {
        unsubscribe() {
          this.user = of(null);
        }
      }
    });
  }

  GetCustomer() {
    return new Promise((resolve, reject) => {
      this.authService.user.subscribe((user) => {
        if(user) {
          const retrieveCustomer = firebase.functions().httpsCallable('getStripeCustomer');
          retrieveCustomer({
            customer: user.stripeCustomerId
          }).then((response) => {
            resolve(response.data);
          }).catch((error) => {
            reject(error);
          })
        } else {
          reject('no-user');
        }
      });
    });
  }

  GetCharges() {
    return new Promise((resolve, reject) => {
      this.authService.user.subscribe((user) => {
        if(user) {
          const retrieveCharges = firebase.functions().httpsCallable('getStripeCharges');
          retrieveCharges({
            customer: user.stripeCustomerId
          }).then((response) => {
            resolve(response.data.data);
          }).catch((error) => {
            reject(error);
          })
        } else {
          reject('no-user');
        }
      });
    });
  }

  GetPaymentMethod(id) {
    return new Promise((resolve, reject) => {
      this.authService.user.subscribe((user) => {
        if(user) {
          const retrieveMethod = firebase.functions().httpsCallable('getStripePaymentMethod');
          retrieveMethod({
            method: id
          }).then((response) => {
            resolve(response.data);
          }).catch((error) => {
            reject(error);
          })
        } else {
          reject('no-user');
        }
      });
    });
  }

  GetPaymentMethods() {
    return new Promise((resolve, reject) => {
      this.authService.user.subscribe((user) => {
        if(user) {
          const retrieveMethod = firebase.functions().httpsCallable('getStripeCustomerPaymentMethods');
          retrieveMethod({
            customer: user.stripeCustomerId
          }).then((response) => {
            resolve(response.data.data);
          }).catch((error) => {
            reject(error);
          })
        } else {
          reject('no-user');
        }
      });
    });
  }

  AddPaymentMethod(payment_method) {
    return new Promise((resolve, reject) => {
      this.authService.user.subscribe((user) => {
        if(user) {
          const addStripePaymentMethod = firebase.functions().httpsCallable('addStripePaymentMethod');
          addStripePaymentMethod({
            method : payment_method,
            customer: user.stripeCustomerId
          }).then((response) => {
            resolve(response.data);
          }).catch((error) => {
            reject(error.message);
          });
        } else {
          reject('no-user');
        }
      });
    });
  }

  DeletePaymentMethod(payment_method) {
    return new Promise((resolve, reject) => {
      this.authService.user.subscribe((user) => {
        if(user) {
          const DeleteStripePaymentMethod = firebase.functions().httpsCallable('deleteStripePaymentMethod');
          DeleteStripePaymentMethod({
            method : payment_method
          }).then((response) => {
            resolve(response.data);
          }).catch((error) => {
            reject(error.message);
          });
        } else {
          reject('no-user');
        }
      });
    });
  }

  CreateSubscriptionCustomer(payment_method: string, email: string) {
    return new Promise((resolve, reject) => {
      const createSubscriptionCustomer = firebase.functions().httpsCallable('createStripeSubscriptionCustomer');
      createSubscriptionCustomer({
        payment_method : payment_method,
        email : email
      }).then((response) => {
        resolve(response.data);
      }).catch((error) => {
        reject(error.message);
      });
    });
  }

  CreateSubscription(customer: string, plan: string) {
    return new Promise((resolve, reject) => {
      const createSubscription = firebase.functions().httpsCallable('createStripeSubscription');
      createSubscription({
        customer: customer,
        plan: plan
      }).then((subscription) => {
        resolve(subscription.data);
      }).catch((error) => {
        reject(error.message);
      });
    });
  }

  UpdateSubscription(subscription: string, details: object) {
    return new Promise((resolve, reject) => {
      const updateSubscription = firebase.functions().httpsCallable('updateStripeSubscription');
      updateSubscription({
        subscription: subscription,
        content: details
      }).then((subscription) => {
        resolve(subscription.data);
      }).catch((error) => {
        reject(error.message);
      });
    });
  }

  CancelSubscription(subscription: string) {
    return new Promise((resolve, reject) => {
      const cancelSubscription = firebase.functions().httpsCallable('cancelStripeSubscription');
      cancelSubscription({
        subscription: subscription,
      }).then((subscription) => {
        resolve(subscription.data);
      }).catch((error) => {
        reject(error.message);
      });
    });
  }

}
