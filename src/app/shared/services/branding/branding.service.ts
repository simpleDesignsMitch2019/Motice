import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AngularFirestore} from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class BrandingService {

  private defaults: object = {
    "primary-color"   : "#007bff",
    "primary-font"    : "sans-serif",
    "secondary-color" : "#6c757d",
  };
  private objects: any = ['primary-color', 'primary-font', 'secondary-color'];

  constructor( private afs: AngularFirestore, private ngxService: NgxUiLoaderService, private messageService: MessageService) {
    this.setBranding();
  }

  private setBranding() {
    this.ngxService.start();
    this.afs.collection('companies').doc(localStorage.getItem('activeCompany')).collection('settings').doc('branding').ref.get().then((dataSnapshot) => {
      if(dataSnapshot.exists) {
        for (var i = this.objects.length - 1; i >= 0; i--) {
          let object = this.objects[i];
          if(dataSnapshot.data()[object]){
            this.setObject(object, dataSnapshot.data()[object]);
          } else {
            this.setObject(object, this.defaults[object]);
          }
        }
        this.ngxService.stop();
      } else {
        for (var i = this.objects.length - 1; i >= 0; i--) {
          let object = this.objects[i];
          this.setObject(object, this.defaults[object]);
        }
        this.ngxService.stop();
      }
    })
  }

  public setObject(object:string, value:string) {
    document.documentElement.style.setProperty(`--${object}`, value);
  }

  public getBranding() {
    return new Promise((resolve, reject) => {
      this.afs.collection('companies').doc(localStorage.getItem('activeCompany')).collection('settings').doc('branding').ref.get().then((dataSnapshot) => {
        if(dataSnapshot.exists) {
          let branding = [];
          for (var i = this.objects.length - 1; i >= 0; i--) {
            let object = this.objects[i];
            if(dataSnapshot.data()[object]){
              branding[object] = dataSnapshot.data()[object];
            } else {
              branding[object] = this.defaults[object];
            }
          }
          resolve(branding);
        } else {
          resolve(this.defaults);
        }
      });
    });
  }

  public updateBranding(data:object) {
    return new Promise((resolve, reject) => {
      this.afs.collection('companies').doc(localStorage.getItem('activeCompany')).collection('settings').doc('branding').ref.set(data, {merge: true}).then((response) => {
        resolve(response);
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      })
    })
  }

}
