import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth/auth.service';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

  public verifyForm: FormGroup;

  constructor( public authService: AuthService, private router: Router ) {
    const user = firebase.auth().currentUser;
    if(user.emailVerified) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  ngOnInit(): void {
    this.verifyForm = new FormGroup({
      'code' : new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
    });
  }

}
