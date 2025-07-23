import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Accueil',
  },
  {
    displayName: 'Tableau de bord',
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
    displayName: 'Commandes groupées',
    iconName: 'notebook-pen', // matches the SVG in the top strip
    route: '/group-orders',
    chip: true,
    chipClass: 'bg-light-success text-success',
    chipContent: 'NOUVEAU',
  },
  {
    displayName: 'Mes commandes',
    iconName: 'list-check', // matches the SVG in the top strip
    route: '/group-orders/my-orders',
  },
  {
    displayName: 'Tous les plats',
    iconName: 'list-details',
    route: '/all-menu-items',
  },
  {
    displayName: 'Catégories',
    iconName: 'category',
    route: '/categories',
  },
];




























