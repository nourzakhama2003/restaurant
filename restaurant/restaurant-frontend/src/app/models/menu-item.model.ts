export interface MenuItem {
  id?: string;
  name: string;              // obligatoire
  description?: string;
  price: number;             // obligatoire
  restaurantId: string;      // obligatoire (pas optionnel)
  deleted?: boolean;
}
