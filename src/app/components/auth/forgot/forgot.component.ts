import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {

  public code: string;
  public forgotForm: FormGroup;
  public resetPasswordForm: FormGroup;

  constructor( private route: ActivatedRoute, public authService: AuthService ) {
    route.params.subscribe((params) => {
      if(params.code) {
        this.authService.CheckPasswordResetCode(params.code).then(() => {
          this.code = params.code;
        }).catch((error) => {
          console.log(error);
        });
      }
    });
  }

  ngOnInit(): void {
    this.forgotForm = new FormGroup({
      'email' : new FormControl('', [Validators.required, Validators.email]),
    });
    this.resetPasswordForm = new FormGroup({
      'password' : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
      'confirm' : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
    });
  }

}
