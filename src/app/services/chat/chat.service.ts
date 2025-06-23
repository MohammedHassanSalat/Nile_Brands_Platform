import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

interface User {
  _id: string;
  name: string;
  userImage?: string;
  isOnline?: boolean;
}

interface Message {
  _id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  status?: 'sent' | 'delivered' | 'read';
  isTemp?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private API_URL = environment.apiUrl + '/messages';
  public currentUser: User | null = null;
  public selectedUser: User | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUsers(): Observable<{ data: User[] }> {
    return this.http.get<{ data: User[] }>(`${this.API_URL}/users`, {
      headers: this.authService.getAuthHeader()
    });
  }

  getChattedUsers(): Observable<{ data: User[] }> {
    return this.http.get<{ data: User[] }>(`${this.API_URL}/chattedUsers`, {
      headers: this.authService.getAuthHeader()
    });
  }

  getMessages(userId: string): Observable<{ data: Message[] }> {
    return this.http.get<{ data: Message[] }>(`${this.API_URL}/${userId}`, {
      headers: this.authService.getAuthHeader()
    });
  }

  sendMessage(receiverId: string, text: string): Observable<{ data: Message }> {
    return this.http.post<{ data: Message }>(`${this.API_URL}/send/${receiverId}`, { text }, {
      headers: this.authService.getAuthHeader()
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
  }
}