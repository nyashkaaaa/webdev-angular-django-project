import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-popular',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular.html',
  styleUrls: ['./popular.css']
})
export class PopularComponent implements OnInit {
  allAnimes: any[] = [];
  isLoading = true;
  hasError = false;
  private apiUrl = 'http://127.0.0.1:8000/api/anime/';

  selectedAnime: any = null;
  currentStatus: string = '';

  statuses = [
    { label: 'Смотрю',        value: 'watching'  },
    { label: 'Просмотрено',   value: 'completed' },
    { label: 'Запланировано', value: 'planned'   },
    { label: 'Брошено',       value: 'dropped'   },
  ];

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, private api: ApiService) {}

  ngOnInit(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.allAnimes = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Django не отвечает:', err);
        this.isLoading = false;
        this.hasError = true;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToAnime(id: number) {
    this.router.navigate(['/anime-detail', id]);
  }

  openStatusModal(anime: any) {
    this.selectedAnime = anime;
    this.currentStatus = anime.userStatus || '';
  }

  closeModal(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('status-overlay')) {
      this.selectedAnime = null;
    }
  }

  selectStatus(status: string) {
    this.currentStatus = status;
  }

  saveStatus() {
    if (!this.currentStatus || !this.selectedAnime) return;
    this.api.addToList({
      anime: this.selectedAnime.id,
      status: this.currentStatus
    }).subscribe({
      next: (saved: any) => {
        this.selectedAnime.userStatus = this.currentStatus;
        this.selectedAnime.listItemId = saved.id;
        this.selectedAnime = null;
        this.cdr.detectChanges();
        this.router.navigate(['/my-list']);
      },
      error: (err: any) => console.error('Ошибка сохранения', err)
    });
  }

  removeFromList() {
    if (!this.selectedAnime?.listItemId) return;
    this.api.deleteFromList(this.selectedAnime.listItemId).subscribe({
      next: () => {
        this.selectedAnime.userStatus = '';
        this.selectedAnime.listItemId = null;
        this.selectedAnime = null;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Ошибка удаления', err)
    });
  }
  
}