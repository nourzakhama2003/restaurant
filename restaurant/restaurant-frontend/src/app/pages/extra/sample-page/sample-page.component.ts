import { Component } from '@angular/core';
//import { MaterialModule } from '../../../material.module';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [  MatCardModule,
              MatIconModule,
              MatButtonModule],
  templateUrl: './sample-page.component.html',
})
export class AppSamplePageComponent {}
