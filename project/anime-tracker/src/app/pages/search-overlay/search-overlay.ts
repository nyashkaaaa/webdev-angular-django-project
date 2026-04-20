import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search-overlay.html',
  styleUrls: ['./search-overlay.css']
})
export class SearchOverlayComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  query = '';
  results: any[] = [];
  loading = false;
  allResults: any[] = [];

  selectedAnime: any = null;
  currentStatus: string = '';

  statuses = [
    { label: 'Watching',  value: 'watching'  },
    { label: 'Completed', value: 'completed' },
    { label: 'Planned',   value: 'planned'   },
    { label: 'Dropped',   value: 'dropped'   },
  ];

  private search$ = new Subject<string>();
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient, private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.http.get<any[]>(`${this.apiUrl}anime/`).subscribe({
      next: (data) => { this.allResults = data; },
      error: () => { this.allResults = []; }
    });

    this.search$.pipe(debounceTime(200), distinctUntilChanged()).subscribe(q => {
      if (!q.trim()) {
        this.results = [];
        return;
      }
      const lower = q.toLowerCase();
      this.results = this.allResults.filter(a =>
        a.title.toLowerCase().includes(lower)
      );
    });
  }

  onInput() {
    this.search$.next(this.query);
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('search-overlay')) {
      this.close.emit();
    }
  }

  openStatusModal(anime: any, event: Event) {
    event.stopPropagation();
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
    this.api.addToList({ anime: this.selectedAnime.id, status: this.currentStatus }).subscribe({
      next: () => {
        this.selectedAnime.userStatus = this.currentStatus;
        this.selectedAnime = null;
        this.close.emit();
        this.router.navigate(['/my-list']);
      },
      error: (err) => console.error('Ошибка сохранения', err)
    });
  }

  removeFromList() {
    this.api.deleteFromList(this.selectedAnime.id).subscribe({
      next: () => {
        this.selectedAnime.userStatus = '';
        this.selectedAnime = null;
      },
      error: (err) => console.error('Ошибка удаления', err)
    });
  }
}
