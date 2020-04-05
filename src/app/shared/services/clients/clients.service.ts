import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { SubscriptionService } from '../../../shared/services/subscription/subscription.service';
import { CompanyService } from '../../../shared/services/company/company.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import * as firebase from 'firebase/app';
import { Client } from '../../../shared/interfaces/client';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor( private authService: AuthService, private companyService: CompanyService, private subscriptionService: SubscriptionService, public messageService: MessageService, public afStore: AngularFirestore, public afFunctions: AngularFireFunctions ) {
  
  }

  private CheckSubscription() {
    return new Promise((resolve, reject) => {
      let countMax;
      this.subscriptionService.subscription.subscribe((observer) => {
        if(observer) {
          observer.subscribe((subscription) => {
            if(subscription) {
              countMax = null;
            } else {
              countMax = 2;
            }
            this.afStore.collection('clients').ref.where('owner', '==', localStorage.getItem('activeCompany')).get().then((clients) => {
              if(!clients.empty) {
                resolve(true);
              } else {
                if(countMax) {
                  if(clients.size < countMax) {
                    resolve(true);
                  } else if(clients.size == countMax) {
                    reject(false);
                  }
                } else {
                  resolve(true);
                }
              }
            }).catch((error) => {
              reject(error);
            });
          });
        } else {
          this.afStore.collection('clients').ref.where('owner', '==', localStorage.getItem('activeCompany')).get().then((clients) => {
            if(!clients.empty) {
              resolve(true);
            } else {
              if(countMax) {
                if(clients.size < countMax) {
                  resolve(true);
                } else if(clients.size == countMax) {
                  reject(false);
                }
              } else {
                resolve(true);
              }
            }
          }).catch((error) => {
            reject(error);
          });
        }
      });
    })
  }

  GetClients() {
    return new Promise((resolve, reject) => {
      this.afStore.collection('clients').ref.where('owner', '==', localStorage.getItem('activeCompany')).get().then((clients) => {
        if(clients.empty) {
          reject('no-clients-found');
        } else {
          let data = [];
          clients.forEach((result) => {
            let client = result.data();
            client['id'] = result.id;
            data.push(client);
          });
          resolve(data);
        }
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  GetClient(id:string) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('clients').doc(id).ref.onSnapshot((client) => {
        if(client.exists) {
          resolve(client.data());
        } else {
          this.messageService.add({severity:'error', summary:'', detail:'No client matches that identifier'});
          reject('no-valid-client');
        }
      });
    });
  }

  CreateClient(data:Client) {
    return new Promise((resolve, reject) => {
      this.CheckSubscription().then((result) => {
        if(result) {
          data['owner'] = localStorage.getItem('activeCompany');
          data['createdOn'] = new Date();
          data['updatedOn'] = new Date();
          this.afStore.collection('clients').add(data).then((value) => {
            value.onSnapshot((client) => {
              this.messageService.add({severity:'success', summary:'', detail:'Client created successfully'});
              resolve(client.data());
            });
          }).catch((error) => {
            this.messageService.add({severity:'error', summary:'', detail:error.message});
            reject(error);
          });
        } else {
          this.messageService.add({severity:'error', summary:'', detail:'You have reached your plans max'});
          reject('plan-max-reached');
        }
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  UpdateClient(id:string, data:object) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('clients').doc(id).update(data).then((response:any) => {
        this.messageService.add({severity:'success', summary:'', detail:'Client updated successfully'});
        resolve(response);
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  DeleteClient(id:string) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('clients').doc(id).delete().then((response:any) => {
        this.messageService.add({severity:'success', summary:'', detail:'Client deleted successfully'});
        resolve(response);
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

}
