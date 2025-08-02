import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from '../../services/core.service';
import { MatListModule } from '@angular/material/list';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TablerIconsModule } from 'angular-tabler-icons';

import { SidebarComponent } from './sidebar/sidebar.component';
import { navItems } from './sidebar/sidebar-data';
import { AppTopstripComponent } from './top-strip/topstrip.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    SidebarComponent,
    NgScrollbarModule,
    TablerIconsModule,
    AppTopstripComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './full.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None
})
export class FullComponent implements OnInit, OnDestroy {
  navItems = navItems;

  @ViewChild('leftsidenav') public sidenav!: MatSidenav;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;

  options: any; // initialise ici mais affectation dans constructeur

  private layoutChangesSubscription: Subscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private _isMediumScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement: HTMLHtmlElement;

  constructor(
    private settings: CoreService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.htmlElement = document.querySelector('html')!;

    this.options = this.settings.getOptions();

    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW])
      .subscribe((state) => {
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
        this._isMediumScreen = state.breakpoints[TABLET_VIEW];
        if (!this.options.sidenavCollapsed) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
      });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.content.scrollTo({ top: 0 });
      });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.layoutChangesSubscription.unsubscribe();
  }

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  get isMediumScreen(): boolean {
    return this._isMediumScreen;
  }

  toggleCollapsed(): void {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }

  resetCollapsedState(timer = 400): void {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }

  onSidenavClosedStart(): void {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean): void {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
  
  }
}
