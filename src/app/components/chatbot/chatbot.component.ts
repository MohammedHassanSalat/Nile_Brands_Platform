import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  providers: [ChatbotService]
})
export class ChatbotComponent implements OnInit {

  chatbot_logo: string = 'images/images ui/chatbot.png';
  chatbot_icon: string = 'images/images ui/chatbot (2).png';
  isChatbotOpen = false;

  messages: {
    text?: string;
    isUser: boolean;
    button?: { text: string; url?: string; action?: () => void };
  }[] = [];

  inputMessage: string = '';

  isMenuOpen = false;

  chatbotData: any = {};

  selectedCategory: string = '';
  selectedCategoryQuestions: any[] = [];

  constructor(private chatbotService: ChatbotService) {}
  ngOnInit(): void {
    this.chatbotService.getChatbotData().subscribe((data) => {
      this.chatbotData = data;
    });
  }

  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
    if (this.isChatbotOpen) {
      this.initializeDefaultMessages();
    }
  }


  initializeDefaultMessages() {
    this.messages = [
      { text: 'Hello! How I can assist you Today? :', isUser: false },
      { text: 'Please select a category to start if you want to help you:', isUser: false }
    ];
  }

  
  sendMessage() {
    if (!this.inputMessage.trim()) return;

    const userMessage = this.inputMessage;
    this.messages.push({ text: userMessage, isUser: true });
    this.inputMessage = '';

    this.messages.push({ text: 'Typing...', isUser: false });

    setTimeout(() => {
      this.getBotResponse(userMessage);
    }, 800);
  }

  getBotResponse(userMessage: string) {
    this.messages = this.messages.filter((msg) => msg.text !== 'Typing...');

    const lowerCaseMessage = userMessage.toLowerCase();
    let bestMatch: any = null;
    let bestScore = 0;


    let faqPool: any[] = [];
    if (this.selectedCategory) {
      const selectedFaq = this.chatbotData?.faqs?.find(
        (f: any) => f.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
      if (selectedFaq) {
        faqPool = selectedFaq.questions;
      }
    } else {
      this.chatbotData?.faqs?.forEach((f: any) => {
        faqPool.push(...f.questions);
      });
    }

    faqPool.forEach((q: any) => {
      const similarity = this.calculateSimilarity(lowerCaseMessage, q.question.toLowerCase());
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = q;
      }
    });

    if (bestMatch && bestScore > 0.5) {
      this.messages.push({ text: bestMatch.answer, isUser: false });
    } else {
      this.handleUnknownQuestion(userMessage);
    }
  }

  calculateSimilarity(str1: string, str2: string): number {
    let matches = 0;
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    words1.forEach((word) => {
      if (words2.includes(word)) matches++;
    });
    return matches / Math.max(words1.length, words2.length);
  }

  handleUnknownQuestion(userMessage: string) {
    const lowerCaseMessage = userMessage.toLowerCase();

    if (
      lowerCaseMessage.includes('payment') ||
      lowerCaseMessage.includes('checkout') ||
      lowerCaseMessage.includes('pay')
    ) {
      this.messages.push({
        text: 'We support payments via Credit/Debit Cards and Digital Wallets.',
        isUser: false
      });
    } else if (
      lowerCaseMessage.includes('shipping') ||
      lowerCaseMessage.includes('delivery')
    ) {
      this.messages.push({
        text: 'Shipping usually takes 3-5 business days. You can track your order under "My Orders".',
        isUser: false
      });
    } else if (
      lowerCaseMessage.includes('register') ||
      lowerCaseMessage.includes('signup')
    ) {
      this.messages.push({
        text: 'You can register as a brand owner or customer by visiting our Sign Up page.',
        isUser: false
      });
    } else {
      this.messages.push({
        text: "I'm not sure about that. Try selecting a category above or ask about payments, shipping, or registration.",
        isUser: false
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    const foundFaq = this.chatbotData?.faqs?.find((f: any) => f.category === category);
    this.selectedCategoryQuestions = foundFaq ? foundFaq.questions : [];
  }

  deselectCategory() {
    this.selectedCategory = '';
    this.selectedCategoryQuestions = [];
  }

  selectSuggestedQuestion(question: string) {
    this.inputMessage = question;
    this.sendMessage();
    this.isMenuOpen = false;
  }
}
