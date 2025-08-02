

import { OrderItem } from "./order-item.model";
export interface ParticipateRequest {
    commandeId: string;
    participantId: string;
    participantName: string;
    items: OrderItem[];
    notes?: string;
}