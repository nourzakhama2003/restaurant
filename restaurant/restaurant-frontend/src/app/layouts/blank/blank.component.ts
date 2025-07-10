import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
//import { MaterialModule } from '../../material.module';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [RouterOutlet, CommonModule,MatCardModule,MatIconModule,MatButtonModule],
  templateUrl: './blank.component.html',
  styleUrls: [],
})
export class BlankComponent implements OnInit {
  private htmlElement!: HTMLHtmlElement;

  options: any;

  constructor(private settings: CoreService) {
    const el = document.querySelector('html');
    if (el) {
      this.htmlElement = el;
    } else {
      console.warn('Element <html> not found');
    }
  }

  ngOnInit(): void {
    this.options = this.settings.getOptions();
  }
}
