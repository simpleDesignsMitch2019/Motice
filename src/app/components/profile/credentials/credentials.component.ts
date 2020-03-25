import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { User } from '../../../shared/interfaces/user';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.css']
})
export class CredentialsComponent implements OnInit {

  public credentialsForm: FormGroup;

  constructor( public authService: AuthService, private messageService: MessageService ) {
    this.credentialsForm = new FormGroup({
      'password' : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
      'confirm'  : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
    });
  }

  ngOnInit(): void {
  }

  updatePassword() {
    const newPass = this.credentialsForm.controls['password'].value;
    const confirm = this.credentialsForm.controls['confirm'].value;
    if(newPass === confirm) {
      this.authService.UpdateUserPassword(newPass).then(() => {

      }).catch(() => {

      });
    } else {
      this.messageService.add({severity:'error', summary:'Error', detail:'Passwords must match'});
    }
  }

}
