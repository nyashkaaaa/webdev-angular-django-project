import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css']
})
export class AiChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  isOpen = false;
  messages: Message[] = [];
  input = '';
  isTyping = false;

  private chatUrl = 'http://127.0.0.1:8000/api/chat/';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.messages.push({
      role: 'bot',
      text: 'Hi! I\'m AniBot AI 🤖\nAsk me about the catalog, genres, or request a recommendation!'
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      if (this.messagesEnd) {
        this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch {}
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  send() {
    const text = this.input.trim();
    if (!text || this.isTyping) return;

    this.messages.push({ role: 'user', text });
    this.input = '';
    this.isTyping = true;

    const history = this.messages
      .slice(1)
      .map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }));

    this.http.post<{ reply?: string; error?: string }>(this.chatUrl, { history }).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.messages.push({
          role: 'bot',
          text: res.reply ?? 'Пустой ответ от сервера.'
        });
      },
      error: (err) => {
        this.isTyping = false;
        const msg = err.error?.error ?? err.message ?? 'Неизвестная ошибка';
        this.messages.push({
          role: 'bot',
          text: `⚠️ Ошибка: ${msg}\n\nПроверь, что Django запущен и переменная GROQ_API_KEY установлена.`
        });
      }
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}
