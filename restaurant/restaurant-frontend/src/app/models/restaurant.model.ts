import { MenuItem } from './menu-item.model';
export interface Restaurant {
  id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  cuisineType: string;
  deleted?: boolean;
  menus?: MenuItem[];
  profileImageBase64?: string;
}
