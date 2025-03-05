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
  // Chatbot icons
  chatbot_logo: string = 'images/images ui/chatbot.png';
  chatbot_icon: string = 'images/images ui/chatbot (2).png';

  // Chatbot open/close state
  isChatbotOpen = false;

  // Array of chat messages
  messages: {
    text?: string;
    isUser: boolean;
    button?: { text: string; url?: string; action?: () => void };
  }[] = [];

  // User's current input in the textbox
  inputMessage: string = '';

  // Menu open/close state (for categories/questions)
  isMenuOpen = false;

  // Data fetched from chatbotData.json (faqs array)
  chatbotData: any = {};

  // Currently selected category and questions
  selectedCategory: string = '';
  selectedCategoryQuestions: any[] = [];

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    // Load the JSON data from assets
    this.chatbotService.getChatbotData().subscribe((data) => {
      this.chatbotData = data;
    });
  }

  // Show/hide the entire chatbot widget
  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
    if (this.isChatbotOpen) {
      this.initializeDefaultMessages();
    }
  }

  // When chatbot is opened, greet user
  initializeDefaultMessages() {
    this.messages = [
      { text: 'Hello! Please select a category to start:', isUser: false }
    ];
  }

  // Send the user’s typed message
  sendMessage() {
    if (!this.inputMessage.trim()) return;

    const userMessage = this.inputMessage;
    // Add user message to chat
    this.messages.push({ text: userMessage, isUser: true });
    this.inputMessage = '';

    // Typing indicator
    this.messages.push({ text: 'Typing...', isUser: false });

    // Simulate a short delay before bot responds
    setTimeout(() => {
      this.getBotResponse(userMessage);
    }, 800);
  }

  // Find a suitable answer from the JSON data
  getBotResponse(userMessage: string) {
    // Remove typing indicator
    this.messages = this.messages.filter((msg) => msg.text !== 'Typing...');

    const lowerCaseMessage = userMessage.toLowerCase();
    let bestMatch: any = null;
    let bestScore = 0;

    // Determine if user has selected a category
    let faqPool: any[] = [];
    if (this.selectedCategory) {
      // Filter questions for the chosen category
      const selectedFaq = this.chatbotData?.faqs?.find(
        (f: any) => f.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
      if (selectedFaq) {
        faqPool = selectedFaq.questions;
      }
    } else {
      // If no category selected, search across all categories
      this.chatbotData?.faqs?.forEach((f: any) => {
        faqPool.push(...f.questions);
      });
    }

    // Calculate similarity with each question in the pool
    faqPool.forEach((q: any) => {
      const similarity = this.calculateSimilarity(lowerCaseMessage, q.question.toLowerCase());
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = q;
      }
    });

    // If similarity is above threshold, respond with the best match
    if (bestMatch && bestScore > 0.5) {
      this.messages.push({ text: bestMatch.answer, isUser: false });
    } else {
      // If no match found, handle fallback
      this.handleUnknownQuestion(userMessage);
    }
  }

  // Basic word overlap to determine similarity
  calculateSimilarity(str1: string, str2: string): number {
    let matches = 0;
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    words1.forEach((word) => {
      if (words2.includes(word)) matches++;
    });
    return matches / Math.max(words1.length, words2.length);
  }

  // Standard fallback for unknown questions
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

  // Toggle the “Suggested Categories” or “Questions” menu
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Select a category from the menu
  selectCategory(category: string) {
    this.selectedCategory = category;
    // Get questions for the chosen category
    const foundFaq = this.chatbotData?.faqs?.find((f: any) => f.category === category);
    this.selectedCategoryQuestions = foundFaq ? foundFaq.questions : [];
    // Hide the menu immediately after clicking

  }

  // Go back to the list of categories
  deselectCategory() {
    this.selectedCategory = '';
    this.selectedCategoryQuestions = [];
  }

  // Click a suggested question under the chosen category
  selectSuggestedQuestion(question: string) {
    this.inputMessage = question;
    this.sendMessage();
    // Hide the menu right after selecting
    this.isMenuOpen = false;
  }
}
