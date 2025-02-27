import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent {
  chatbot_logo: string = 'images/images ui/chatbot.png';
  chatbot_icon: string = 'images/images ui/chatbot (2).png';
  isChatbotOpen = false;
  messages: { text: string; isUser: boolean; isTyping?: boolean }[] = [];
  inputMessage: string = ''; 
  isMenuOpen: boolean = false; 

  defaultQuestions = [
    { question: "What is the 'Nile Brands Platform'?", answer: "'Nile Brands' is an innovative app and web platform that supports Egyptian startups and local brand owners." },
    { question: "How can I get support for my startup?", answer: "You can reach out through our contact form on the website for personalized assistance." },
    { question: "What services do you provide?", answer: "We provide marketing, funding, and mentorship services for startups." },
    { question: "How do I register on your platform?", answer: "You can register by visiting our website and clicking the 'Sign Up' button." },
    { question: "Do you offer funding opportunities?", answer: "Yes! We connect startups with investors who are interested in funding new businesses." },
    { question: "Can I collaborate with other startups?", answer: "Absolutely! Our platform provides networking opportunities for startups to collaborate and grow." }
  ];

  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
    if (this.isChatbotOpen) {
      this.initializeDefaultMessages();
    }
  }

  initializeDefaultMessages() {
    this.messages = [{ text: "Hello! How can I assist you today?", isUser: false }];
  }

  sendMessage() {
    if (this.inputMessage.trim()) {
      const userMessage = this.inputMessage;
      this.messages.push({ text: userMessage, isUser: true });
      this.inputMessage = ''; 

      // Show typing indicator
      this.messages.push({ text: "Typing...", isUser: false, isTyping: true });

      setTimeout(() => {
        this.getBotResponse(userMessage);
      }, 1000);
    }
  }

  getBotResponse(userMessage: string) {
    this.messages = this.messages.filter(msg => !msg.isTyping); 
    const response = this.defaultQuestions.find(q => q.question.toLowerCase() === userMessage.toLowerCase());

    if (response) {
      this.messages.push({ text: response.answer, isUser: false });
    } else {
      this.messages.push({ text: "I'm sorry, I don't understand that. Try asking something else.", isUser: false });
    }
  }

  selectSuggestedQuestion(question: string) {
    this.inputMessage = question; 
    this.sendMessage();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
