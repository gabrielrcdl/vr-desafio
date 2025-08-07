import { Component, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';
import { NotificationInterface } from '../interfaces/notification.interface';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnDestroy {
  message = '';
  notifications: NotificationInterface[] = [];
  pollingSubscription: Subscription;

  constructor(private readonly notificationService: NotificationService) {
    this.pollingSubscription = interval(3000).subscribe(() =>
      this.atualizarStatus()
    );
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  sendNotification() {
    if (!this.message.trim()) return;

    this.notificationService
      .createNotification(this.message)
      .subscribe((res) => {
        this.notifications.unshift({
          messageId: res.messageId,
          message: this.message,
          status: 'AGUARDANDO PROCESSAMENTO',
        });
        this.message = '';
      });
  }

  atualizarStatus() {
    this.notifications.forEach((n, index) => {
      if (n.status === 'AGUARDANDO PROCESSAMENTO') {
        this.notificationService.getStatus(n.messageId).subscribe((res) => {
          this.notifications[index].status = res.status;
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PROCESSADO_SUCESSO':
        return 'status-success';
      case 'FALHA_PROCESSAMENTO':
        return 'status-error';
      default:
        return 'status-pending';
    }
  }

  isButtonDisabled(): boolean {
    return !this.message || this.message.trim().length === 0;
  }
}
