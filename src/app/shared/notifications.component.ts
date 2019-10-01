import { Component, OnInit, OnDestroy } from '@angular/core';
import { Message } from 'primeng/components/common/message';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-notifications',
  template: `
    <p-toast life="3000" position="top-right"></p-toast>
  `
})
export class NotificationsComponent implements OnInit, OnDestroy {
  toast: Message[] = [];
  message: Message[] = [];
  toastSubscription: Subscription;
  messageSubscription: Subscription;

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit() {
    console.log('NotificationsComponent');
  }

  ngOnDestroy() {}
}
