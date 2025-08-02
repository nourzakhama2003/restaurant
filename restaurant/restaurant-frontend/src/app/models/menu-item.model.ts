export interface MenuItem {
  id?: string;
  restaurantId: string;
  categoryId?: string;
  categoryName?: string; 
  name: string;
  description?: string;
  price: number;
  imageBase64?: string; 
  deleted?: boolean;
}
