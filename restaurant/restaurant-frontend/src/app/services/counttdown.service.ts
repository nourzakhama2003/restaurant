import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommandeService, Commande } from './commande.service';

interface Countdown {
    display: string;
    color: string;
}

@Injectable({
    providedIn: 'root'
})
export class CountdownService implements OnDestroy {
    private hours!:number;
    private minutes!:number;
    private seconds!:number;
    private countdowns: { [commandeId: string]: { subject: BehaviorSubject<Countdown>, timer: any } } = {};

    constructor(private commandeService: CommandeService) { }

    startCountdown(commande: Commande): Observable<Countdown> {
        if (this.countdowns[commande.id]) {
            this.stopCountdown(commande.id);
        }

        const subject = new BehaviorSubject<Countdown>({ display: 'Calculating...', color: 'time-normal' });
        this.countdowns[commande.id] = { subject, timer: null };

        this.updateCountdown(commande);

        const timer = setInterval(() => {
            this.updateCountdown(commande);
        }, 1000);

        this.countdowns[commande.id].timer = timer;
        return subject.asObservable();
    }

    private updateCountdown(commande: Commande): void {
        const countdown = this.countdowns[commande.id];
        if (!commande.orderDeadline || !countdown) {
            countdown.subject.next({ display: 'No deadline', color: 'time-normal' });
            if (countdown.timer) {
                clearInterval(countdown.timer);
                countdown.timer = null;
            }
            return;
        }
        const deadline = new Date(commande.orderDeadline).getTime() - (60 * 60 * 1000); // UTC
        const now = Date.now(); // UTC
        const diff = deadline - now;

        if (diff<=0) {
            countdown.subject.next({ display: 'Expired', color: 'time-critical' });
            clearInterval(countdown.timer);
            countdown.timer = null;

            // ✅ Force re-checking status inside the component
            if (commande.status === 'created') {
                this.commandeService.updateCommandeStatus(commande.id, 'validated').subscribe({
                    next: () => {
                        commande.status = 'closed';
                        // ✅ Manually trigger another countdown emission (optional but safe)
                        countdown.subject.next({ display: 'Expired', color: 'time-critical' });
                    },
                    error: (error: any) => console.error('Error updating status:', error)
                });
            }

            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        this.hours = Math.floor(totalSeconds / 3600);
        this.minutes = Math.floor((totalSeconds % 3600) / 60);
        this.seconds = totalSeconds % 60;
        const display = `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
        const color = totalSeconds <= 30 ? 'time-critical' : totalSeconds <= 300 ? 'time-warning' : 'time-normal';
        countdown.subject.next({ display, color });
    }

    stopCountdown(commandeId: string): void {
        if (this.countdowns[commandeId]) {
            if (this.countdowns[commandeId].timer) {
                clearInterval(this.countdowns[commandeId].timer);
            }
            this.countdowns[commandeId].subject.complete();
            delete this.countdowns[commandeId];
        }
    }

    ngOnDestroy(): void {
        Object.values(this.countdowns).forEach(c => {
            if (c.timer) clearInterval(c.timer);
            c.subject.complete();
        });
        this.countdowns = {};
    }
}