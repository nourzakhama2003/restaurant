import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-grid-add',
    route: '/dashboard',
  },
  {
    displayName: 'Restaurant',
    iconName: 'border-outer',
    route: '/restaurant',
    chip: true,
    chipClass: 'bg-light-primary text-primary',
    chipContent: 'PRO',
  },
  {
    displayName: 'commandes',
    iconName: 'notebook-pen', // matches the SVG in the top strip
    route: '/group-orders',
    chip: true,
    chipClass: 'bg-light-success text-success',
    chipContent: 'NEW',
  },
  {
    displayName: 'my orders',
    iconName: 'list-check', // matches the SVG in the top strip
    route: '/group-orders/my-orders',
  },
];




























