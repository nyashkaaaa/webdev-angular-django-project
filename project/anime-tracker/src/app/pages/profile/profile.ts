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
    username: 'Otaku',
    level: "1",
    avatar: '',
    totalAnime: 0,
    totalEpisodes: 0,
    totalHours: 0,
  };

  animeList: any[] = [];
  filteredList: any[] = [];

  statusLabels: Record<string, string> = {
    all: 'All',
    watching: 'Watching',
    completed: 'Completed',
    planned: 'Planned',
    dropped: 'Dropped',
  };

  statusCounts: Record<string, number> = {
    all: 0,
    watching: 0,
    completed: 0,
    planned: 0,
    dropped: 0,
  };

  achievements = [
  { icon: '▶', title: 'First Step', description: 'Watch the first episode of any anime', unlocked: true, date: 'January 12, 2025' },
  { icon: '🔥', title: 'On Fire', description: 'Watch 10 episodes in one day', unlocked: true, date: 'February 18, 2025' },
  { icon: '📚', title: 'Librarian', description: 'Add 10 anime to your list', unlocked: true, date: 'March 3, 2025' },
  { icon: '⭐', title: 'Critic', description: 'Leave your first review on an anime', unlocked: false, date: '' },
  { icon: '🎯', title: 'Marathoner', description: 'Watch an anime completely within 24 hours', unlocked: false, date: '' },
  { icon: '👁', title: 'All-Seeing', description: 'Watch 50 different anime', unlocked: false, date: '' },
  { icon: '💎', title: 'Collector', description: 'Add 25 anime to your favourites', unlocked: false, date: '' },
  { icon: '🌙', title: 'Night Watch', description: 'Watch anime past midnight 7 days in a row', unlocked: false, date: '' },
  { icon: '🏆', title: 'Legend', description: 'Watch 100 anime', unlocked: false, date: '' },
  { icon: '✨', title: 'Otaku', description: 'Spend more than 500 hours on the site', unlocked: false, date: '' },
];

  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}
  

  reviews: any[] = [];

ngOnInit(): void {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

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