import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private jsonUrl = 'assets/chatbot-data.json'; // Ensure JSON is in assets folder

  constructor(private http: HttpClient) {}

  getChatbotData(): Observable<any> {
    return this.http.get<any>(this.jsonUrl);
  }
}
