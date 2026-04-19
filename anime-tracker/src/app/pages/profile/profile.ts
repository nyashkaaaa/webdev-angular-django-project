import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProfileSettingsComponent } from '../profile-settings/profile-settings';

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
  showSettings = false;

  user = {
    username: localStorage.getItem('username') || 'Отаку',
    level: '1',
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
    all: 0, watching: 0, completed: 0, planned: 0, dropped: 0,
  };

  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(`${this.apiUrl}my-list/`, { headers }).subscribe({
      next: (data) => {
        this.animeList = data;
        this.calcStats();
        this.filterList();
      },
      error: (err) => console.error('Ошибка загрузки списка', err)
    });
  }

  calcStats() {
    this.statusCounts['all'] = this.animeList.length;
    ['watching', 'completed', 'planned', 'dropped'].forEach(s => {
      this.statusCounts[s] = this.animeList.filter(a => a.status === s).length;
    });
    this.user.totalAnime = this.animeList.length;
    this.user.totalEpisodes = this.animeList.reduce((sum, a) => sum + (a.anime?.episodes || 0), 0);
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

  onSettingsSave(data: any) {
    if (data.username) this.user.username = data.username;
    if (data.avatarPreview) this.user.avatar = data.avatarPreview;
  }
}
