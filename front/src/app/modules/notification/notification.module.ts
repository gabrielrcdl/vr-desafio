import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from './notification.service';
import { NotificationComponent } from './components/notification.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule],
  declarations: [NotificationComponent],
  providers: [NotificationService],
  exports: [NotificationComponent],
})
export class NotificationModule {}
