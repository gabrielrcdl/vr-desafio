import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private API_URL = 'http://localhost:3000/api/notificar';

  constructor(private http: HttpClient) {}

  createNotification(
    message: string
  ): Observable<{ messageId: string; status: string }> {
    const messageId = uuidv4();
    return this.http.post<{ messageId: string; status: string }>(this.API_URL, {
      messageId,
      message,
    });
  }

  getStatus(
    messageId: string
  ): Observable<{ messageId: string; status: string }> {
    return this.http.get<{ messageId: string; status: string }>(
      `${this.API_URL}/status/${messageId}`
    );
  }
}
