import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from '../../../shared/services/company/company.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { User } from '../../../shared/interfaces/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public registerForm: FormGroup;

  constructor( public authService: AuthService, public router: Router, public companyService: CompanyService, public messageService: MessageService ) { }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      'company' : new FormControl('', [Validators.required]),
      'name'  : new FormControl('', [Validators.required]),
      'email' : new FormControl('', [Validators.required, Validators.email]),
      'passw' : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
      'confi' : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)])
    });
  }

  attemptRegister() {
    this.companyService.CheckAvailability(this.registerForm.controls['company'].value).then((value) => {
      this.authService.RegisterWithEmail(this.registerForm.controls['email'].value, this.registerForm.controls['passw'].value).then((user:User) => {
        this.companyService.CreateCompany({'name' : this.registerForm.controls['company'].value}).then((companyResult) => {
          this.authService.UpdateUserData({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: this.registerForm.controls['name'].value,
            photoURL: user.photoURL,
            company: companyResult
          }).then(() => {
            this.router.navigateByUrl('/auth/verify');
          }).catch((error) => {
            this.messageService.add({severity:'error', summary:'', detail:error.message});
          });
        }).catch((error) => {
          this.messageService.add({severity:'error', summary:'', detail:error.message});
        });
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
      });
    }).catch((error) => {
      if(error = 'name-already-exists') {
        this.messageService.add({severity:'error', summary:'', detail:'Company name already exists'});
      }
    });
  }

}
