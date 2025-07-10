import { Component, ViewEncapsulation } from '@angular/core';
//import { MaterialModule} from '../../material.module';
import { AppSalesOverviewComponent } from '../../components/sales-overview/sales-overview.component';
import { AppDailyActivitiesComponent } from '../../components/daily-activities/daily-activities.component';
import { AppProductPerformanceComponent } from '../../components/product-performance/product-performance.component';
import { AppBlogComponent } from '../../components/apps-blog/apps-blog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-starter',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    AppSalesOverviewComponent,
    AppDailyActivitiesComponent,
    AppProductPerformanceComponent,
    AppBlogComponent,
  ],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent { }
