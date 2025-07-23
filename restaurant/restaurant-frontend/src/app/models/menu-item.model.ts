export interface MenuItem {
  id?: string;
  restaurantId: string;
  categoryId?: string; // Reference to Category
  categoryName?: string; // For display
  name: string;
  description?: string;
  price: number;
  imageBase64?: string; // Optional image in base64
  deleted?: boolean;
}
