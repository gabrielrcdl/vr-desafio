import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { NotificationModule } from './modules/notification/notification.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, NotificationModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
