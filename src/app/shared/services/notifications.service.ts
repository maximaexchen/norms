import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MessageService } from 'primeng/components/common/messageservice';

type Severities = 'success' | 'info' | 'warn' | 'error';

@Injectable()
export class NotificationsService {
  constructor(private messageService: MessageService) {}

  addSingle(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail
    });
  }

  addMultiple() {
    this.messageService.addAll([
      {
        severity: 'success',
        summary: 'Service Message',
        detail: 'Via MessageService'
      },
      {
        severity: 'info',
        summary: 'Info Message',
        detail: 'Via MessageService'
      }
    ]);
  }

  clear() {
    this.messageService.clear();
  }
}
