import { Component, OnInit, OnDestroy } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Client } from '../../../shared/interfaces/client';
import { ClientsComponent } from '../clients.component';
import { ClientsService } from '../../../shared/services/clients/clients.service';

@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.css']
})
export class EditClientComponent implements OnInit, OnDestroy {

  public loading: boolean = true;

  private myTimerSub: Subscription;

  public editClientForm: FormGroup;
  public client: any;

  constructor( private clientsComponent: ClientsComponent, public clientsService: ClientsService ) {
   this.editClientForm = new FormGroup({
      'addressLine1' : new FormControl('', [Validators.required]),
      'addressLine2' : new FormControl(''),
      'city' : new FormControl('', [Validators.required]),
      'company' : new FormControl('', [Validators.required]),
      'email' : new FormControl('', [Validators.required, Validators.email]),
      'fax' : new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
      'first_name' : new FormControl('', [Validators.required]),
      'last_name' : new FormControl('', [Validators.required]),
      'number' : new FormControl(null, [Validators.required]),
      'phone' : new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
      'state' : new FormControl('', [Validators.required, Validators.maxLength(2), Validators.minLength(2)]),
      'zip_code' : new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(5)])
    });
  }

  ngOnInit(): void {
    const ti = timer(2000,1000);
    this.myTimerSub = ti.subscribe(t => {
      if(this.clientsComponent.editSidebarVisible && this.client == null) {
        this.client = this.clientsComponent.selectedClient();
        Object.keys(this.editClientForm.controls).forEach(key => {
          this.editClientForm.controls[key].setValue(this.clientsComponent.selectedClient()[key]);
        });
        this.loading = false;
      } else if(!this.clientsComponent.editSidebarVisible) {
        this.client = null;
        this.editClientForm.reset();
        this.loading = true;
      }
    });
  }

  ngOnDestroy() {
    this.myTimerSub.unsubscribe();
  }

  close() {
    this.clientsComponent.editSidebarVisible = false;
  }

  updateClient() {
    this.loading = true;
    let data:any= {};
    Object.keys(this.editClientForm.controls).forEach(key => {
      data[key] = this.editClientForm.controls[key].value;
    });
    this.clientsService.UpdateClient(this.client.id, data).then((response) => {
      this.close();
      this.editClientForm.reset();
      this.loading = false;
    }).catch((error) => {
      console.log(error);
      this.loading = false;
    });
  }

}
