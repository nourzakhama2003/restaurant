import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CoreService } from '../../../services/core.service';
//import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [
    RouterModule,
      MatCardModule,
      MatIconModule,
      MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule
  ],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent implements OnInit {
  form: FormGroup;
  options: any;

  private settings = inject(CoreService); // méthode alternative à constructor
  private router = inject(Router);

  constructor() {
    this.form = new FormGroup({
      uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.options = this.settings.getOptions();
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    // console.log(this.form.value);
    this.router.navigate(['/']);
  }
}
