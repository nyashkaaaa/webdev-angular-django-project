import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.css'
})
export class ChatBotComponent {
  isOpen = false;
  userInput = '';
  isLoading = false;
  messages: { text: string; isUser: boolean }[] = [
    { text: 'Привет! Я AniBot. Какое аниме ищем сегодня?', isUser: false }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    this.messages.push({ text: this.userInput, isUser: true });
    this.userInput = '';
    this.isLoading = true;

    const history = this.messages.slice(1).map(m => ({
      role: m.isUser ? 'user' : 'assistant',
      content: m.text
    }));

    this.http.post<{ reply: string }>('http://127.0.0.1:8000/api/chat/', { history })
      .subscribe({
        next: (res) => {
          this.messages.push({ text: res.reply, isUser: false });
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.messages.push({ text: 'Ошибка соединения с сервером. Попробуй ещё раз.', isUser: false });
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}
