import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Client } from '../../../shared/interfaces/client';
import { ClientsComponent } from '../clients.component';
import { ClientsService } from '../../../shared/services/clients/clients.service';

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.css']
})
export class CreateClientComponent implements OnInit {

  public newClientForm: FormGroup;

  constructor( private clientsComponent: ClientsComponent, public clientsService: ClientsService ) {
   this.newClientForm = new FormGroup({
      'addressLine1' : new FormControl('', [Validators.required]),
      'addressLine2' : new FormControl(''),
      'city' : new FormControl('', [Validators.required]),
      'company' : new FormControl('', [Validators.required]),
      'currentBalance' : new FormControl(0),
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
    
  }

  close() {
    this.clientsComponent.newSidebarVisible = false;
  }

  createClient() {
    let data:any= {};
    Object.keys(this.newClientForm.controls).forEach(key => {
      data[key] = this.newClientForm.controls[key].value;
    });
    this.clientsService.CreateClient(data).then((response) => {
      this.close();
      this.newClientForm.reset();
    }).catch((error) => {
      console.log(error);
    });
  }

}
