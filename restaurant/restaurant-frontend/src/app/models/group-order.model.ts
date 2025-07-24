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
    items: OrderItem[];
    totalAmount: number;
    notes?: string;
    createdAt: Date;
    deleted?: boolean;
    paye?: boolean;
}

export interface ParticipateRequest {
    commandeId: string;
    participantId: string;
    participantName: string;
    items: OrderItem[];
    notes?: string;
}

export interface UpdateOrderRequest {
    participantId: string;
    items: OrderItem[];
    notes?: string;
}
