export interface User {
    id: string;
    name: string;
    email: string;
    commandes?: any[];
    orders?: any[];
    deleted?: boolean;
}