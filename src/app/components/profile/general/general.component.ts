import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { User } from '../../../shared/interfaces/user';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})
export class GeneralComponent implements OnInit {

  public generalForm: FormGroup;
  public user: User;
  public emailVerified: boolean = true;

  constructor( private messageService: MessageService, private authService: AuthService ) {
    this.generalForm = new FormGroup({
      'displayName' : new FormControl('', [Validators.required]),
      'email' : new FormControl('', [Validators.required, Validators.email]),
      'photoURL' : new FormControl('')
    });
    this.authService.user.subscribe((user) => {
      if(user) {
        this.user = user;
        this.emailVerified = user.emailVerified;
        this.generalForm.controls['displayName'].setValue(user.displayName);
        this.generalForm.controls['email'].setValue(user.email);
        this.generalForm.controls['photoURL'].setValue(user.photoURL);
      }
    });
  }

  ngOnInit(): void {
    this.generalForm.controls['email'].valueChanges.subscribe((value) => {
      if(value) {
        if(value === this.user.email) {
          this.emailVerified = true;
        } else {
          this.emailVerified = false;
        }
      } else {
        this.generalForm.controls['email'].setValue(this.user.email);
      }
    });
  }

  updateDetails() {
    if(this.user.email !== this.generalForm.controls['email'].value) {
      this.authService.UpdateUserEmail(this.generalForm.controls['email'].value).then(() => {
        
      }).catch((error) => {

      });
    }
    this.authService.UpdateUserData({
      'uid' : this.user.uid,
      'emailVerified' : this.emailVerified,
      'displayName' : this.generalForm.controls['displayName'].value,
      'email' : this.generalForm.controls['email'].value,
      'photoURL' : this.generalForm.controls['photoURL'].value,
    }).then(() => {
      this.messageService.add({severity:'success', summary:'Success', detail:'Profile details updated successfully.'});
    }).catch((error) => {
      this.messageService.add({severity:'error', summary:'', detail:error.message});
    });
  }

}
