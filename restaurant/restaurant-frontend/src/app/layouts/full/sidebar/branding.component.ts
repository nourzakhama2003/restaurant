import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../../services/core.service';


@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [],
  template: `
    <a href="/" class="logodark">

    </a>
  `,
})
export class BrandingComponent implements OnInit {
  options: any;

  constructor(private settings: CoreService) {}

  ngOnInit(): void {
    this.options = this.settings.getOptions();
  }
}
