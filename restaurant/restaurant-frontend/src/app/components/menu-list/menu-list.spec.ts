import { ComponentFixture, TestBed } from '@angular/core/testing';

  import { MenuListComponent } from './menu-list.component';

describe('MenuListComponent', () => {
    let component: MenuListComponent;
  let fixture: ComponentFixture<MenuListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
