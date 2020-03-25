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
    authService.user.subscribe((user) => {
      if(user && user.emailVerified) {
        this.router.navigateByUrl('/dashboard');
      } else if(!user) {
        this.router.navigateByUrl('/login');
      }
    });
  }

  ngOnInit(): void {
    this.verifyForm = new FormGroup({
      'code' : new FormControl('', [Validators.required, Validators.maxLength(6), Validators.minLength(6)]),
    });
  }

}
