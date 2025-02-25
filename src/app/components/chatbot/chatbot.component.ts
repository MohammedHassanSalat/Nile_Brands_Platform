import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent {
  isChatbotOpen = false;
  messages: { text: string; isUser: boolean }[] = [];
  defaultQuestions = [
    {
      question: "What is the 'Nile Brands Platform'?",
      answer: "'Nile Brands' is an innovative app and web platform that supports Egyptian startups and local brand owners."
    },
    {
      question: "How can I get support for my startup?",
      answer: "You can reach out through our contact form on the website for personalized assistance."
    },
    {
      question: "What services do you provide?",
      answer: "We provide marketing, funding, and mentorship services for startups."
    }
  ];

  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
    if (this.isChatbotOpen) {
      this.initializeDefaultMessages();
    }
  }

  initializeDefaultMessages() {
    this.messages = this.defaultQuestions.map(q => ({
      text: q.question,
      isUser: true
    }));
  }

  sendMessage(userMessage: string) {
    if (userMessage.trim()) {
      this.messages.push({ text: userMessage, isUser: true });
      this.getBotResponse(userMessage);
    }
  }

  getBotResponse(userMessage: string) {
    const response = this.defaultQuestions.find(q => q.question.toLowerCase() === userMessage.toLowerCase());
    if (response) {
      this.messages.push({ text: response.answer, isUser: false });
    } else {
      this.messages.push({ text: "I'm sorry, I don't understand that.", isUser: false });
    }
  }
  
}