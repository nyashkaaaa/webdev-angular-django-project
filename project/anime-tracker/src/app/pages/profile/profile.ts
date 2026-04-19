import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ProfileSettingsComponent } from '../profile-settings/profile-settings';
import { Token } from '@angular/compiler';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, ProfileSettingsComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'list';
  activeStatus: string = 'all';
  viewMode: 'list' | 'grid' = 'list';

  user = {
    username: 'Отаку',
    level: "1",
    avatar: '',
    totalAnime: 0,
    totalEpisodes: 0,
    totalHours: 0,
  };

  animeList: any[] = [];
  filteredList: any[] = [];

  statusLabels: Record<string, string> = {
    all: 'Все',
    watching: 'Смотрю',
    completed: 'Просмотрено',
    planned: 'Запланировано',
    dropped: 'Брошено',
  };

  statusCounts: Record<string, number> = {
    all: 0,
    watching: 0,
    completed: 0,
    planned: 0,
    dropped: 0,
  };

  achievements = [
  { icon: '▶', title: 'Первый шаг', description: 'Посмотрите первый эпизод любого аниме', unlocked: true, date: '12 января 2025' },
  { icon: '🔥', title: 'На огне', description: 'Посмотрите 10 серий за один день', unlocked: true, date: '18 февраля 2025' },
  { icon: '📚', title: 'Библиотекарь', description: 'Добавьте 10 аниме в свой список', unlocked: true, date: '3 марта 2025' },
  { icon: '⭐', title: 'Критик', description: 'Оставьте первый отзыв на аниме', unlocked: false, date: '' },
  { icon: '🎯', title: 'Марафонец', description: 'Просмотрите аниме полностью за 24 часа', unlocked: false, date: '' },
  { icon: '👁', title: 'Всевидящий', description: 'Просмотрите 50 различных аниме', unlocked: false, date: '' },
  { icon: '💎', title: 'Коллекционер', description: 'Добавьте 25 аниме в избранное', unlocked: false, date: '' },
  { icon: '🌙', title: 'Ночной страж', description: 'Смотрите аниме после полуночи 7 дней подряд', unlocked: false, date: '' },
  { icon: '🏆', title: 'Легенда', description: 'Просмотрите 100 аниме', unlocked: false, date: '' },
  { icon: '✨', title: 'Отаку', description: 'Проведите на сайте более 500 часов', unlocked: false, date: '' },
];

  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}
  

  reviews: any[] = [];

ngOnInit(): void {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Token ${token}` };

  // Список аниме (уже есть)
  this.http.get<any[]>(`${this.apiUrl}user-anime-list/`, { headers }).subscribe({
    next: (data) => {
      this.animeList = data;
      this.calcStats();
      this.filterList();
    },
    error: (err) => console.error('Ошибка загрузки списка', err)
  });

  // Отзывы — добавь это
  this.http.get<any[]>(`${this.apiUrl}my-reviews/`, { headers }).subscribe({
    next: (data) => { this.reviews = data; },
    error: (err) => console.error('Ошибка загрузки отзывов', err)
  });
}
  calcStats() {
    this.statusCounts['all'] = this.animeList.length;
    ['watching', 'completed', 'planned', 'dropped'].forEach(s => {
      this.statusCounts[s] = this.animeList.filter(a => a.status === s).length;
    });
    this.user.totalAnime = this.animeList.length;
    this.user.totalEpisodes = this.animeList.reduce((sum, a) => sum + (a.anime_detail?.episodes || 0), 0);
    this.user.totalHours = Math.round(this.user.totalEpisodes * 23 / 60);
  }

  filterList() {
    this.filteredList = this.activeStatus === 'all'
      ? this.animeList
      : this.animeList.filter(a => a.status === this.activeStatus);
  }

  setStatus(status: string) {
    this.activeStatus = status;
    this.filterList();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  showSettings = false;

  onSettingsSave(data: any) {
    if (data.username) this.user.username = data.username;
    if (data.avatarPreview) this.user.avatar = data.avatarPreview;
    console.log('Сохранено:', data);
}

}