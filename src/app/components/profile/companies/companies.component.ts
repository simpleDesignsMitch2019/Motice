import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Company } from '../../../shared/interfaces/company';
import { MessageService } from 'primeng/api';
import { CompanyService } from '../../../shared/services/company/company.service';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  public company: Company;

  public nameChecked: boolean;
  public nameChecking: boolean;
  public nameAvailable: boolean;

  public companyDetailsForm: FormGroup;

  constructor( public companyService: CompanyService, private messageService: MessageService ) {
    companyService.company.subscribe((observer) => {
      if(observer) {
        observer.subscribe((company) => {
          this.company = company;
          Object.keys(this.companyDetailsForm.controls).forEach(key => {
            if(this.company[key]) {
              this.companyDetailsForm.controls[key].setValue(this.company[key]);
            }
            this.nameAvailable = true;
          });
        });
      }
    });
  }

  ngOnInit(): void {
    this.companyDetailsForm = new FormGroup({
      'name' : new FormControl({value:'', disabled:true}, [Validators.required]),
      'ein' : new FormControl(''),
      'dba' : new FormControl(''),
      'logo' : new FormControl({value:'',disabled:true}),
      'email' : new FormControl('', [Validators.required, Validators.email]),
      'phone' : new FormControl('', [Validators.required]),
      'fax' : new FormControl(''),
      'support_email' : new FormControl('', [Validators.required, Validators.email]),
      'support_phone' : new FormControl('', [Validators.required]),
      'addressLine1' : new FormControl('', [Validators.required]),
      'addressLine2' : new FormControl(''),
      'city' : new FormControl('', [Validators.required]),
      'state' : new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      'zip_code' : new FormControl('', [Validators.required])
    });
  }

  checkName() {
    let name = this.companyDetailsForm.controls['name'].value;
    if(name) {
      this.nameChecked = true;
      this.nameChecking = true;
      this.companyService.CheckAvailability(name).then((response) => {
        this.nameChecking = false;
        this.nameAvailable = true;
      }).catch((error) => {
        if(error == 'name-already-exists') {
          this.nameChecking = false;
          this.nameAvailable = false;
        }
      })
    } else {
      this.nameChecked = false;
      this.nameChecking = false;
      this.nameAvailable = false;
    }
  }

  logoUpload(event) {
    let file = event.target.files[0];
    let fileName = file.name;
    this.companyDetailsForm.controls['logo'].setValue(fileName);
  }

  update() {
    this.companyService.GetActiveUid(this.company.name).then((uid:string) => {
      let data:any= {};
      Object.keys(this.companyDetailsForm.controls).forEach(key => {
        if(key == 'ein') {
          data[key] = this.companyDetailsForm.controls[key].value.replace(/-/g, '');
        } else if(key == 'fax' || key == 'phone' || key == 'support_phone') {
          data[key] = this.companyDetailsForm.controls[key].value.replace('(', '').replace(')', '').replace('-', '').replace(/ /g, '');
        } else {
          data[key] = this.companyDetailsForm.controls[key].value;
        }
      });
      this.companyService.UpdateCompany(uid, data).then((response) => {
        this.messageService.add({severity:'success', summary:'', detail:'Company updated successfully'});
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
      });
    }).catch((error) => {
      this.messageService.add({severity:'error', summary:'', detail:error.message});
    });
  }

}
