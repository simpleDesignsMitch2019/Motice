import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SubscriptionService } from '../../../shared/services/subscription/subscription.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';

import { User } from '../../../shared/interfaces/user';

import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  templateUrl: './add-payment-method.component.html'
})
export class AddCardComponent implements OnInit {

  loading: boolean = true;

  user: User;
  
  elements: Elements;
  card: StripeElement;

  elementOptions: ElementsOptions = {
    locale: 'en'
  };

  constructor( public messageService: MessageService, private ngxService: NgxUiLoaderService, private authService: AuthService, private subscriptionService: SubscriptionService, private stripeService: StripeService, public ref: DynamicDialogRef, public config: DynamicDialogConfig ) {  }

  ngOnInit() {
    this.ngxService.start();
    this.authService.user.subscribe((user:User) => {
      if(user) {
        this.user = user;
      }
    });
    this.stripeService.elements(this.elementOptions).subscribe(elements => {
      this.elements = elements;
      if(!this.card) {
        this.card = this.elements.create('card', {
          style: {
            base: {
              iconColor: '#666EE8',
              color: '#000000',
              lineHeight: '40px',
              fontWeight: 300,
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSize: '18px',
              '::placeholder': {
                color: '#495054'
              }
            }
          }
        });
        this.card.mount('#card-element');
        this.ngxService.stop();
      }
    });
  }

  addCard() {
    this.ngxService.start();
    this.stripeService.createPaymentMethod('card', this.card).subscribe((result) => {
      if(result.paymentMethod) {
        this.subscriptionService.AddPaymentMethod(result.paymentMethod.id).then((response:any) => {
          if(response.id) {
            this.ref.close(response);
            this.ngxService.stop();
          } else {
            this.messageService.add({severity:'error', summary: '', detail:'Something went wrong, please try again.'});
            this.ngxService.stop();
          }
        })
      } else if(result.error) {
        this.messageService.add({severity:'error', summary: '', detail:'Something went wrong, please contact support.'});
        this.ngxService.stop();
      }
    })
  }

}

@Component({
  templateUrl: './subscribe-modal.component.html'
})
export class SubscrbeComponent implements OnInit {

  loading: boolean = true;

  user: User;
  
  elements: Elements;
  card: StripeElement;

  elementOptions: ElementsOptions = {
    locale: 'en'
  };

  constructor( public messageService: MessageService, private ngxService: NgxUiLoaderService, private authService: AuthService, private subscriptionService: SubscriptionService, private stripeService: StripeService, public ref: DynamicDialogRef, public config: DynamicDialogConfig ) {  }

  ngOnInit() {
    this.ngxService.start();
    this.authService.user.subscribe((user:User) => {
      if(user) {
        this.user = user;
      }
    });
    this.stripeService.elements(this.elementOptions).subscribe(elements => {
      this.elements = elements;
      if(!this.card) {
        this.card = this.elements.create('card', {
          style: {
            base: {
              iconColor: '#666EE8',
              color: '#000000',
              lineHeight: '40px',
              fontWeight: 300,
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSize: '18px',
              '::placeholder': {
                color: '#495054'
              }
            }
          }
        });
        this.card.mount('#card-element');
        this.ngxService.stop();
      }
    });
  }

  subscribe() {
    this.ngxService.start();
    this.stripeService.createPaymentMethod('card', this.card).subscribe((result) => {
      if(result.paymentMethod) {
        this.subscriptionService.CreateSubscriptionCustomer(result.paymentMethod.id, this.user.email).then((customer:any) => {
          if(customer.id) {
            this.subscriptionService.CreateSubscription(customer.id, 'motice-standard').then((subscription:any) => {
              if(subscription.id) {
                this.ref.close(subscription);
                this.ngxService.stop();
              } else {
                this.messageService.add({severity:'error', summary: '', detail:'No subscription ID, please contact support.'});
                this.ngxService.stop();
              }
            }).catch((error) => {
              this.messageService.add({severity:'error', summary: '', detail:error});
              this.ngxService.stop();
            })
          } else {
            this.messageService.add({severity:'error', summary: '', detail:'No customer ID, please contact support.'});
            this.ngxService.stop();
          }
        }).catch((error) => {
          this.messageService.add({severity:'error', summary: '', detail:error});
          this.ngxService.stop();
        });
      } else if(result.error) {
        this.messageService.add({severity:'error', summary: '', detail:'Something went wrong, please contact support.'});
        this.ngxService.stop();
      }
    });
  }

}

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {

  public subscription: object;
  public customer: object;
  public paymentMethods: object;
  public defaultMethod: string;
  public charges: object;

  constructor( public messageService: MessageService, private dialogService: DialogService, public authService: AuthService, public subscriptionService: SubscriptionService ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.subscriptionService.subscription.subscribe((subscription) => {
      if(subscription) {
        subscription.subscribe((result) => {
          this.subscription = result;
          this.subscriptionService.GetCustomer().then((customer:any) => {
            this.customer = customer;
            if(customer) {
              if(result.default_payment_method) {
                this.defaultMethod = result.default_payment_method;
              } else {
                this.defaultMethod = customer.invoice_settings.default_payment_method;
              }
              this.subscriptionService.GetPaymentMethods().then((paymentMethods:any) => {
                this.paymentMethods = paymentMethods;
                this.subscriptionService.GetCharges().then((charges:any) => {
                  this.charges = charges;
                }).catch((error) => {
                  this.messageService.add({severity:'error', summary: '', detail:error});
                })
              }).catch((error) => {
                this.messageService.add({severity:'error', summary: '', detail:error});
              })
            }
          }).catch((error) => {
            this.messageService.add({severity:'error', summary: '', detail:error});
          })
        });
      }
    });
  }

  openSubscribeDialog() {
    const ref = this.dialogService.open(SubscrbeComponent, {
      showHeader: false,
      dismissableMask: true,
      width: '20%'
    });
    ref.onClose.subscribe((subscription) => {
      if(subscription) {

      } else {

      }
    });
  }

  openAddCardDialog() {
    const ref = this.dialogService.open(AddCardComponent, {
      showHeader: false,
      dismissableMask: true,
      width: '20%'
    });
    ref.onClose.subscribe((subscription) => {
      if(subscription) {
        this.subscriptionService.GetPaymentMethods().then((paymentMethods:any) => {
          this.paymentMethods = paymentMethods;
        });
      } else {

      }
    });
  }

  findChargeDate(subscription) {
    if(subscription) {
      const cycle_end_date = new Date((subscription.current_period_end*1000));
      return new Date(cycle_end_date.getTime() + (1000 * 60 * 60 * 24));
    }
  }

  deleteMethod(method) {
    this.subscriptionService.DeletePaymentMethod(method).then((response) => {
      this.messageService.add({severity:'success', summary: 'Success', detail:'Payment Method Deleted'});
      this.subscriptionService.GetPaymentMethods().then((paymentMethods:any) => {
        this.paymentMethods = paymentMethods;
      });
    }).catch((error) => {
      this.messageService.add({severity:'error', summary: '', detail:error});
    });
  }

  setDefaultMethod(method) {
    this.subscriptionService.UpdateSubscription(this.subscription['id'], {'default_payment_method' : method}).then((response) => {
      this.messageService.add({severity:'success', summary: 'Success', detail:'Payment Method Updated'});
    }).catch((error) => {
      this.messageService.add({severity:'error', summary: '', detail:error});
    });
  }

  cancelSubscriptionNow() {
    this.subscriptionService.CancelSubscription(this.subscription['id']).then((response) => {
      this.messageService.add({severity:'success', summary: 'Success', detail:'Subscription Was Canceled'});
    }).catch((error) => {
      this.messageService.add({severity:'error', summary: '', detail:error});
    });
  }

  statusCheck(status) {
    switch (status) {
      case "succeeded":
      return 'badge-success';
      break;
      case "pending":
      return 'badge-info';
      break;
      case "failed":
      return 'badge-warning';
      break;
      default:
      return '';
      break;
    }
  }

}
