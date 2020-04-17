import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbdSortableHeader, SortEvent } from '../../../shared/directives/NgbdSortableHeader/ngbd-sortable-header.directive';
import { CoasService } from '../../../shared/services/coas/coas.service';

const compare = (v1:string, v2:string) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

interface Account {
  "account_name": string,
  "account_number" : string,
  "account_type" : string,
  "balance" : number,
  "children" : any
}

@Component({
  selector: 'app-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.css']
})
export class ChartOfAccountsComponent implements OnInit {

  public accounts: Account[];
  public sortedAccounts: Account[];

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  onSort({column, direction}: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    if (direction === '' || column === '') {
      this.sortedAccounts = this.accounts;
    } else {
      this.sortedAccounts = [...this.accounts].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  constructor( public coas: CoasService ) { }

  ngOnInit(): void {
    this.coas.chartOfAccounts.subscribe((observer) => {
      observer.subscribe((accounts) => {
        this.accounts = accounts;
        this.sortedAccounts = this.accounts;
      });
    });
  }

}
