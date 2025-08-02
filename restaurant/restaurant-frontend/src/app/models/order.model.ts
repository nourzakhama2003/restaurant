import { OrderItem } from "./order-item.model";
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
    livraisonFeePerParticipant?: number;
}