import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
//import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule,   MatCardModule,
                            MatIconModule,
                            MatButtonModule, FormsModule, ReactiveFormsModule,MatFormFieldModule,MatCheckboxModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(private router: Router) {}

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.valid) {
      // Tu peux gérer la logique de connexion ici
      // Par exemple, appeler un service d’authentification

      this.router.navigate(['/']);
    } else {
      this.form.markAllAsTouched(); // pour afficher les erreurs si invalides
    }
  }
}
