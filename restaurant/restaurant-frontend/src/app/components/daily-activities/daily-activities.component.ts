import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';

interface transactions {
  id: number;
  iconColor: string;
  icon: string;
  title: string;
  subtitle: string;
  amount: string;
  status: string;
}

@Component({
  selector: 'app-daily-activities',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    TablerIconsModule
  ],
  templateUrl: './daily-activities.component.html',
})
export class AppDailyActivitiesComponent {
  transactions: transactions[] = [
    {
      id: 1,
      iconColor: 'secondary',
      icon: 'currency-dollar',
      title: 'PayPal Transfer',
      subtitle: 'Money Added',
      amount: '+$350',
      status: 'success',
    },
    {
      id: 2,
      iconColor: 'success',
      icon: 'shield',
      title: 'Wallet',
      subtitle: 'Bill Payment',
      amount: '-$560',
      status: 'error',
    },
    {
      id: 3,
      iconColor: 'error',
      icon: 'credit-card',
      title: 'Credit Card',
      subtitle: 'Money reversed',
      amount: '+$350',
      status: 'success',
    },
    {
      id: 4,
      iconColor: 'warning',
      icon: 'check',
      title: 'Bank Transfer',
      subtitle: 'Money Added',
      amount: '+$350',
      status: 'success',
    },
  ];
}
