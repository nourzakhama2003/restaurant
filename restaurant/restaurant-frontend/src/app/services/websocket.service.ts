import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { AppKeycloakService } from './keycloak.service';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
    private client!: Client;
    private subject = new Subject<any>();
    private subscription: any;

    constructor(private keycloakService: AppKeycloakService) { }

    async connect(commandeId: string): Promise<Observable<any>> {
        const token = await this.keycloakService.getToken();
        this.client = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8081/ws?access_token=${token}`),
            // debug: (msg: string) => { console.log('[STOMP DEBUG]', msg); }, // Remove debug logs
            reconnectDelay: 5000,
        });
        this.client.onConnect = () => {
            // console.log('WebSocket connected for commandeId:', commandeId);
            this.subscription = this.client.subscribe(`/topic/group-orders/${commandeId}`, (message: IMessage) => {
                // console.log('WebSocket message received for commandeId:', commandeId, 'message:', message.body);
                this.subject.next(JSON.parse(message.body));
            });
        };
        this.client.activate();
        return this.subject.asObservable();
    }

    disconnect() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.client && this.client.active) {
            this.client.deactivate();
        }
    }
} 