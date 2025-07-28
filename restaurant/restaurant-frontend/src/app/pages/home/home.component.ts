import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollAnimateDirective } from './scroll-animate.directive';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterModule, ScrollAnimateDirective],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent { } 