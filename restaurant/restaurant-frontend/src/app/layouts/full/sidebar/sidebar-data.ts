import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    displayName: 'Accueil',
    iconName: 'home',
    route: '/',
  },
  {
    navCap: 'Navigation',
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
    displayName: 'Commandes ',
    iconName: 'notebook-pen',
    route: '/group-orders',
    chip: true,
    chipClass: 'bg-light-success text-success',
    chipContent: 'NOUVEAU',
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




























