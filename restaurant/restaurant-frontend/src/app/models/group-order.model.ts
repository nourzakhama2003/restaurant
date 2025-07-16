export interface OrderItem {
    menuItemId: string;
    menuItemName: string;
    unitPrice: number;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    commandeId: string;
    participantId: string;
    participantName: string;
    participantPhone: string;
    items: OrderItem[];
    totalAmount: number;
    notes?: string;
    createdAt: Date;
    deleted?: boolean;
}

export interface GroupCommande {
    id: string;
    restaurantId: string;
    creatorId: string;
    creatorName: string;
    status: string; // 'created', 'closed', 'confirmed', 'cancelled'
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    orderDeadline: Date; // Full date and time when order participation closes
    orders: Order[];
    deleted?: boolean;
}

export interface CreateGroupCommandeRequest {
    restaurantId: string;
    creatorId: string;
    creatorName: string;
    orderDeadline: Date;
}

export interface ParticipateRequest {
    commandeId: string;
    participantId: string;
    participantName: string;
    participantPhone: string;
    items: OrderItem[];
    notes?: string;
}

export interface UpdateOrderRequest {
    participantId: string;
    items: OrderItem[];
    notes?: string;
}
