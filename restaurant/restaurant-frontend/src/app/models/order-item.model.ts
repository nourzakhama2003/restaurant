export interface OrderItem {
    menuItemId: string;
    menuItemName: string;
    unitPrice: number;
    quantity: number;
    notes?: string;
}