export interface MenuItem {
  id?: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  imageBase64?: string; // Optional image in base64
  deleted?: boolean;
}
