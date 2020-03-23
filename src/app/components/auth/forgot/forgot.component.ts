import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {

  public forgotForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
    this.forgotForm = new FormGroup({
      'email' : new FormControl('', [Validators.required, Validators.email]),
    });
  }

}
