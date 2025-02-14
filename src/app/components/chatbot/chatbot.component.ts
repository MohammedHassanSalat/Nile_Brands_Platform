import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent {
  isChatbotOpen = false;
  userMessage = '';

  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
  }
}
