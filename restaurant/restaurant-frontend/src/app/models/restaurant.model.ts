import { MenuItem } from './menu-item.model';
export interface Restaurant {
  id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  cuisineType: string;
  deleted?: boolean;
  // Backend uses 'menus' field for menu items
  menus?: MenuItem[];
  profileImageBase64?: string;
}
