import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { NavService } from '../../../../services/nav.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
//import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [TranslateModule, TablerIconsModule, CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './nav-item.component.html',
  styles: [`
    .menu-list-item {
      padding: 14px 26px;
      border-radius: 8px;
      margin-bottom: 8px;
      margin-left: 0;
      transition: color 0.2s;
    }
    .menu-list-item:last-child {
      margin-bottom: 20px;
    }
    .nav-caption {
      font-size: 13px;
      color: #9ca3af;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 18px 0 4px 0;
      padding-left: 26px;
    }
    .menu-list-item:hover {
      cursor: pointer;
      color: #4f46e5;
    }
    .menu-list-item.activeMenu,
    .menu-list-item.activeMenu:focus,
    .menu-list-item.activeMenu:hover {
      color: #4f46e5 !important;
      font-weight: bold;
      cursor: pointer;
      background: none;
      border-left: none;
      box-shadow: none;
    }
    .menu-list-item.activeMenu .routeIcon {
      color: #4f46e5 !important;
    }
    .menu-list-item.activeMenu .hide-menu {
      color: #4f46e5 !important;
    }
  `],
})
export class AppNavItemComponent implements OnChanges {
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() item: NavItem | any;

  expanded: any = false;

  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() depth: any;

  constructor(public navService: NavService, public router: Router) { }

  ngOnChanges() {
    const url = this.navService.currentUrl();
    if (this.item.route && url) {
      this.expanded = url.indexOf(`/${this.item.route}`) === 0;
      this.ariaExpanded = this.expanded;
    }
  }

  onItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    if (!this.expanded) {
      if (window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }

  openExternalLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  onSubItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      if (this.expanded && window.innerWidth < 1024) {
        this.notify.emit();
      }
    }
  }
}
