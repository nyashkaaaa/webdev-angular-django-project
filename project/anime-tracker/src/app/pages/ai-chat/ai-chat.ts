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
  animeList: any[] = [];
  isDataLoading = true;

  private apiUrl = 'http://127.0.0.1:8000/api/anime/';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.messages.push({
      role: 'bot',
      text: 'Привет! Я AniBot AI 🤖\nСпроси меня о каталоге, жанрах или попроси что-нибудь порекомендовать!'
    });
    // Загружаем список аниме сразу при создании компонента (один раз)
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.animeList = data;
        this.isDataLoading = false;
      },
      error: () => {
        this.isDataLoading = false;
      }
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
    if (!text) return;
    this.messages.push({ role: 'user', text });
    this.input = '';

    if (this.isDataLoading) {
      // Данные ещё грузятся — ждём их, потом отвечаем
      this.isTyping = true;
      const waitAndRespond = setInterval(() => {
        if (!this.isDataLoading) {
          clearInterval(waitAndRespond);
          this.isTyping = false;
          this.messages.push({ role: 'bot', text: this.getResponse(text) });
        }
      }, 100);
      // Таймаут 5 секунд на случай если сервер не ответил
      setTimeout(() => {
        clearInterval(waitAndRespond);
        this.isTyping = false;
        if (this.animeList.length === 0) {
          this.messages.push({ role: 'bot', text: 'Не могу подключиться к серверу. Убедись, что Django запущен на порту 8000.' });
        }
      }, 5000);
      return;
    }

    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      this.messages.push({ role: 'bot', text: this.getResponse(text) });
    }, 600);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private getResponse(msg: string): string {
    const lower = msg.toLowerCase();

    // Приветствие
    if (/привет|здравствуй|хай|hello|sup/.test(lower)) {
      return 'Привет! 👋 Чем могу помочь? Спроси про аниме на сайте, жанры или попроси рекомендацию!';
    }

    // Помощь
    if (/помощь|помоги|что умеешь|что можешь|help/.test(lower)) {
      return 'Я умею:\n• Показать все аниме на сайте\n• Найти аниме по жанру\n• Порекомендовать что посмотреть\n• Рассказать о конкретном аниме\n\nПросто напиши что хочешь!';
    }

    // Список всех аниме
    if (/список|какие аниме|все аниме|что есть|что на сайте|аниме на сайте/.test(lower)) {
      if (this.animeList.length === 0) {
        return 'Не удалось загрузить каталог. Убедись, что сервер запущен (Django на порту 8000).';
      }
      const list = this.animeList.map((a, i) => `${i + 1}. ${a.title} (${a.release_year})`).join('\n');
      return `На сайте есть следующие аниме:\n${list}`;
    }

    // Рекомендации
    if (/рекоменд|посоветуй|что смотреть|что посмотреть|посмотреть|выбери|выбор/.test(lower)) {
      if (this.animeList.length === 0) {
        return 'Не могу загрузить каталог. Попробуй позже.';
      }
      const random = this.animeList[Math.floor(Math.random() * this.animeList.length)];
      return `Рекомендую посмотреть:\n🎬 ${random.title} (${random.release_year})\n\n${random.description}`;
    }

    // Поиск по жанру
    if (/жанр|экшен|action|приключен|комеди|драм|фэнтези|fantasy|романтик|сёнен|сенен|shonen|сёдзё|седзё|мистик|триллер|спорт|повседнев|сейнен/.test(lower)) {
      return this.handleGenreSearch(lower);
    }

    // Количество аниме
    if (/сколько|количество/.test(lower)) {
      if (this.animeList.length === 0) {
        return 'Не могу загрузить данные. Проверь сервер.';
      }
      return `В каталоге сейчас ${this.animeList.length} аниме!`;
    }

    // Поиск конкретного аниме
    const foundAnime = this.animeList.find(a =>
      a.title.toLowerCase().includes(lower) ||
      lower.includes(a.title.toLowerCase())
    );
    if (foundAnime) {
      const genres = foundAnime.genres?.map((g: any) => g.name).join(', ') || 'нет данных';
      return `🎬 ${foundAnime.title} (${foundAnime.release_year})\n📺 Серий: ${foundAnime.episodes}\n🎭 Жанры: ${genres}\n\n${foundAnime.description}`;
    }

    // Дефолт
    return 'Хм, не совсем понял вопрос 🤔\nПопробуй:\n• "Какие аниме есть на сайте?"\n• "Порекомендуй что-нибудь"\n• "Аниме в жанре экшен"';
  }

  private handleGenreSearch(lower: string): string {
    if (this.animeList.length === 0) {
      return 'Не могу загрузить каталог. Проверь что сервер запущен.';
    }

    const genreMap: Record<string, string[]> = {
      'экшен': ['экшен', 'action', 'экшн'],
      'приключение': ['приключен'],
      'комедия': ['комеди'],
      'драма': ['драм'],
      'фэнтези': ['фэнтези', 'fantasy', 'фантези'],
      'романтика': ['романтик'],
      'сёнен': ['сёнен', 'сенен', 'shonen'],
      'сёдзё': ['сёдзё', 'седзё', 'shoujo'],
      'мистика': ['мистик'],
      'триллер': ['триллер'],
      'спорт': ['спорт'],
      'повседневность': ['повседнев'],
      'сэйнэн': ['сейнен', 'сэйнэн'],
    };

    let matchedGenreName = '';
    for (const [genre, keywords] of Object.entries(genreMap)) {
      if (keywords.some(k => lower.includes(k))) {
        matchedGenreName = genre;
        break;
      }
    }

    if (!matchedGenreName) {
      const allGenres = [...new Set(
        this.animeList.flatMap((a: any) => a.genres?.map((g: any) => g.name) || [])
      )];
      return `Доступные жанры:\n${allGenres.map(g => `• ${g}`).join('\n')}\n\nСпроси: "Аниме в жанре [название]"`;
    }

    const filtered = this.animeList.filter((a: any) =>
      a.genres?.some((g: any) => g.name.toLowerCase() === matchedGenreName.toLowerCase())
    );

    if (filtered.length === 0) {
      return `Аниме с жанром "${matchedGenreName}" пока нет в каталоге.`;
    }

    return `Аниме в жанре "${matchedGenreName}":\n` +
      filtered.map((a: any) => `• ${a.title} (${a.release_year})`).join('\n');
  }
}
