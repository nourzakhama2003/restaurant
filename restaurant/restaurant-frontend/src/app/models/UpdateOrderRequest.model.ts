


import type { OrderItem } from "./order-item.model";

export interface UpdateOrderRequest {
    participantId: string;
    items: OrderItem[];
    notes?: string;
}
