import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { SubscriptionService } from '../../shared/services/subscription/subscription.service';
import { ClientsService } from '../../shared/services/clients/clients.service';

import { CreateClientComponent } from './create-client/create-client.component';
import { EditClientComponent } from './edit-client/edit-client.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  public searchTerm: string;

  public newSidebarVisible: boolean = false;
  public editSidebarVisible: boolean = false;

  public clients: any;
  public filteredClients: any;
  public singleClient: object;

  public clientMax: number = 2;
  public clientCount: number = 0;

  public outstandingInvoices: number = 0;

  public newClientsThisMonth: number = 0;

  constructor( public subscriptionService: SubscriptionService, public clientsService: ClientsService ) {
    this.subscriptionService.subscription.subscribe((result) => {
      if(result) {
        result.subscribe((subscription) => {
          if(subscription.status == 'active') {
            this.clientMax = null;
          } else {
            this.clientMax = 2;
          }
        });
      }
    });
    this.loadClients();
  }

  loadClients() {
    this.clientCount = 0;
    this.newClientsThisMonth = 0;
    this.clientsService.GetClients().then((clients:any) => {
      this.clientCount = clients.length;
      this.clients = clients;
      this.filteredClients = this.clients;
      for (var i = clients.length - 1; i >= 0; i--) {
        if(new Date(clients[i]).getFullYear == new Date().getFullYear && new Date(clients[i]).getMonth == new Date().getMonth) {
          this.newClientsThisMonth++;
        }
      }
    }).catch((error) => {

    });
  } 

  ngOnInit(): void {

  }

  closeSidebar() {
    this.loadClients();
  }

  openEditClient(client) {
    this.singleClient = client;
    this.editSidebarVisible = true;
  }

  selectedClient() {
    return this.singleClient;
  }

  delete(client) {
    this.clientsService.DeleteClient(client.id).then((response) => {
      this.loadClients();
    }).catch((error) => {

    });
  }

}
